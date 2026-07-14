//! Interactive PTY sessions for the LaunchOS terminal panel.
//!
//! Uses `portable-pty` (Rust equivalent of node-pty) because Tauri has no Node runtime.

use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use serde::Serialize;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

pub struct PtySession {
    writer: Mutex<Box<dyn Write + Send>>,
    master: Mutex<Box<dyn MasterPty + Send>>,
    /// Kept alive so the shell process is not dropped while the session exists.
    _child: Mutex<Box<dyn Child + Send + Sync>>,
}

pub struct PtyManager {
    sessions: Mutex<HashMap<String, PtySession>>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    pub fn spawn(
        &self,
        session_id: String,
        shell: Option<String>,
        cwd: Option<String>,
        cols: u16,
        rows: u16,
        app: AppHandle,
    ) -> Result<(), String> {
        {
            let sessions = self.sessions.lock().map_err(|e| e.to_string())?;
            if sessions.contains_key(&session_id) {
                // Frontend remounted (e.g. Strict Mode / tab keep-alive) — keep existing PTY.
                return Ok(());
            }
        }

        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows: rows.max(1),
                cols: cols.max(1),
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;

        let shell_path = resolve_shell(shell);
        let mut cmd = CommandBuilder::new(&shell_path);

        // Login shell so zsh/bash load user configs (same idea as node-pty + shell args).
        if shell_path.contains("zsh") || shell_path.contains("bash") {
            cmd.arg("-l");
        }

        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");
        cmd.env("LANG", std::env::var("LANG").unwrap_or_else(|_| "en_US.UTF-8".into()));
        cmd.env(
            "LC_ALL",
            std::env::var("LC_ALL").unwrap_or_else(|_| "en_US.UTF-8".into()),
        );

        if let Some(dir) = cwd.as_ref().filter(|d| !d.is_empty()) {
            let path = PathBuf::from(dir);
            if path.is_dir() {
                cmd.cwd(path);
            }
        }

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("failed to spawn {shell_path}: {e}"))?;
        drop(pair.slave);

        let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
        let master = pair.master;
        let reader = master
            .try_clone_reader()
            .map_err(|e| e.to_string())?;

        {
            let mut sessions = self.sessions.lock().map_err(|e| e.to_string())?;
            sessions.insert(
                session_id.clone(),
                PtySession {
                    writer: Mutex::new(writer),
                    master: Mutex::new(master),
                    _child: Mutex::new(child),
                },
            );
        }

        let sid = session_id.clone();
        let app_handle = app.clone();
        std::thread::Builder::new()
            .name(format!("pty-reader-{sid}"))
            .spawn(move || {
                let mut reader = reader;
                let mut buf = [0u8; 8192];
                loop {
                    match reader.read(&mut buf) {
                        Ok(0) => break,
                        Ok(n) => {
                            let data = String::from_utf8_lossy(&buf[..n]).to_string();
                            let _ = app_handle.emit(
                                &format!("terminal-output-{sid}"),
                                TerminalOutputPayload { data },
                            );
                        }
                        Err(_) => break,
                    }
                }
                let _ = app_handle.emit(
                    &format!("terminal-exit-{sid}"),
                    TerminalExitPayload { code: None },
                );
                if let Ok(mut sessions) = app_handle.state::<PtyManager>().sessions.lock() {
                    sessions.remove(&sid);
                }
            })
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn write(&self, session_id: &str, data: &str) -> Result<(), String> {
        let sessions = self.sessions.lock().map_err(|e| e.to_string())?;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| format!("unknown terminal session: {session_id}"))?;
        let mut writer = session.writer.lock().map_err(|e| e.to_string())?;
        writer
            .write_all(data.as_bytes())
            .map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let sessions = self.sessions.lock().map_err(|e| e.to_string())?;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| format!("unknown terminal session: {session_id}"))?;
        let master = session.master.lock().map_err(|e| e.to_string())?;
        master
            .resize(PtySize {
                rows: rows.max(1),
                cols: cols.max(1),
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn kill(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().map_err(|e| e.to_string())?;
        if let Some(session) = sessions.remove(session_id) {
            if let Ok(mut child) = session._child.lock() {
                let _ = child.kill();
            }
        }
        Ok(())
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalOutputPayload {
    pub data: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalExitPayload {
    pub code: Option<i32>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShellInfo {
    pub id: String,
    pub label: String,
    pub path: String,
    pub available: bool,
}

fn first_existing(paths: &[&str]) -> Option<String> {
    paths
        .iter()
        .find(|path| Path::new(path).is_file())
        .map(|path| (*path).to_string())
}

fn resolve_shell_id(id: &str) -> Option<String> {
    match id {
        "zsh" => first_existing(&["/bin/zsh", "/usr/bin/zsh", "/usr/local/bin/zsh"]),
        "bash" => first_existing(&["/bin/bash", "/usr/bin/bash", "/usr/local/bin/bash"]),
        "pwsh" => first_existing(&[
            "pwsh",
            "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
        ])
        .or_else(|| Some("pwsh".to_string())),
        "powershell" => Some("powershell.exe".to_string()),
        _ => None,
    }
}

fn resolve_shell(shell: Option<String>) -> String {
    let Some(raw) = shell.filter(|value| !value.is_empty()) else {
        return detect_shell();
    };

    if let Some(path) = resolve_shell_id(&raw) {
        return path;
    }

    if Path::new(&raw).is_file() {
        return raw;
    }

    detect_shell()
}

fn detect_shell() -> String {
    if cfg!(target_os = "windows") {
        return resolve_shell_id("pwsh")
            .or_else(|| resolve_shell_id("powershell"))
            .unwrap_or_else(|| "powershell.exe".to_string());
    }

    // Prefer zsh on macOS when present; otherwise respect $SHELL, then bash.
    if cfg!(target_os = "macos") {
        if let Some(zsh) = resolve_shell_id("zsh") {
            return zsh;
        }
    }

    if let Ok(shell) = std::env::var("SHELL") {
        if Path::new(&shell).is_file() {
            return shell;
        }
    }

    resolve_shell_id("zsh")
        .or_else(|| resolve_shell_id("bash"))
        .unwrap_or_else(|| "/bin/bash".to_string())
}

#[tauri::command]
pub fn terminal_list_shells() -> Vec<ShellInfo> {
    if cfg!(target_os = "windows") {
        let pwsh = resolve_shell_id("pwsh");
        let powershell = resolve_shell_id("powershell");
        return vec![
            ShellInfo {
                id: "pwsh".into(),
                label: "PowerShell".into(),
                path: pwsh.clone().unwrap_or_else(|| "pwsh".into()),
                available: pwsh.is_some(),
            },
            ShellInfo {
                id: "powershell".into(),
                label: "Windows PowerShell".into(),
                path: powershell
                    .clone()
                    .unwrap_or_else(|| "powershell.exe".into()),
                available: true,
            },
        ];
    }

    let zsh = resolve_shell_id("zsh");
    let bash = resolve_shell_id("bash");
    vec![
        ShellInfo {
            id: "zsh".into(),
            label: "zsh".into(),
            path: zsh.clone().unwrap_or_else(|| "/bin/zsh".into()),
            available: zsh.is_some(),
        },
        ShellInfo {
            id: "bash".into(),
            label: "bash".into(),
            path: bash.clone().unwrap_or_else(|| "/bin/bash".into()),
            available: bash.is_some(),
        },
    ]
}

#[tauri::command]
pub fn terminal_create(
    session_id: String,
    cols: u16,
    rows: u16,
    cwd: Option<String>,
    shell: Option<String>,
    app: AppHandle,
    manager: State<'_, PtyManager>,
) -> Result<(), String> {
    manager.spawn(session_id, shell, cwd, cols, rows, app)
}

#[tauri::command]
pub fn terminal_write(
    session_id: String,
    data: String,
    manager: State<'_, PtyManager>,
) -> Result<(), String> {
    manager.write(&session_id, &data)
}

#[tauri::command]
pub fn terminal_resize(
    session_id: String,
    cols: u16,
    rows: u16,
    manager: State<'_, PtyManager>,
) -> Result<(), String> {
    manager.resize(&session_id, cols, rows)
}

#[tauri::command]
pub fn terminal_kill(session_id: String, manager: State<'_, PtyManager>) -> Result<(), String> {
    manager.kill(&session_id)
}
