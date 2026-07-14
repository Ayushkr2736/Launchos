//! Git Engine for LaunchOS Source Control.
//! Shells out to system `git` (no libgit2) with `-C <repo>` for repo-scoped ops.

use serde::Serialize;
use std::path::Path;
use std::process::Command;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitFileEntry {
    pub path: String,
    /// Short status letter for display (M, A, D, R, C, U, ?).
    pub status: String,
    pub staged: bool,
    pub unstaged: bool,
    pub untracked: bool,
    pub conflicted: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatusSnapshot {
    pub is_repo: bool,
    pub branch: Option<String>,
    pub upstream: Option<String>,
    pub ahead: u32,
    pub behind: u32,
    pub has_conflicts: bool,
    pub files: Vec<GitFileEntry>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommandResult {
    pub ok: bool,
    pub stdout: String,
    pub stderr: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitBranchInfo {
    pub name: String,
    pub is_current: bool,
    pub is_remote: bool,
    pub upstream: Option<String>,
    pub tip: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitInfo {
    pub hash: String,
    pub short_hash: String,
    pub author: String,
    pub email: String,
    pub timestamp: i64,
    pub subject: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStashEntry {
    pub index: u32,
    pub reflog: String,
    pub message: String,
    pub timestamp: i64,
}

fn validate_repo(repo: &str) -> Result<(), String> {
    let path = Path::new(repo);
    if !path.is_absolute() {
        return Err("repository path must be absolute".into());
    }
    if !path.is_dir() {
        return Err(format!("not a directory: {repo}"));
    }
    Ok(())
}

fn run_git_raw(cwd: Option<&str>, args: &[&str]) -> Result<GitCommandResult, String> {
    let mut command = Command::new("git");
    if let Some(dir) = cwd {
        command.current_dir(dir);
    }
    let output = command
        .args(args)
        .output()
        .map_err(|e| format!("failed to run git: {e}"))?;

    Ok(GitCommandResult {
        ok: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).trim_end().to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).trim_end().to_string(),
    })
}

fn run_git(repo: &str, args: &[&str]) -> Result<GitCommandResult, String> {
    validate_repo(repo)?;
    let mut full = Vec::with_capacity(args.len() + 2);
    full.push("-C");
    full.push(repo);
    full.extend_from_slice(args);
    run_git_raw(None, &full)
}

fn run_git_checked(repo: &str, args: &[&str]) -> Result<String, String> {
    let result = run_git(repo, args)?;
    if !result.ok {
        let message = if !result.stderr.is_empty() {
            result.stderr
        } else if !result.stdout.is_empty() {
            result.stdout
        } else {
            "git command failed".into()
        };
        return Err(message);
    }
    Ok(result.stdout)
}

fn empty_snapshot(is_repo: bool) -> GitStatusSnapshot {
    GitStatusSnapshot {
        is_repo,
        branch: None,
        upstream: None,
        ahead: 0,
        behind: 0,
        has_conflicts: false,
        files: vec![],
    }
}

fn status_letter(code: char) -> String {
    match code {
        'M' => "M".into(),
        'A' => "A".into(),
        'D' => "D".into(),
        'R' => "R".into(),
        'C' => "C".into(),
        'U' => "U".into(),
        'T' => "T".into(),
        '?' => "?".into(),
        '!' => "!".into(),
        _ => code.to_string(),
    }
}

fn parse_porcelain_v2(raw: &str) -> GitStatusSnapshot {
    let mut branch: Option<String> = None;
    let mut upstream: Option<String> = None;
    let mut ahead: u32 = 0;
    let mut behind: u32 = 0;
    let mut files: Vec<GitFileEntry> = Vec::new();
    let mut has_conflicts = false;

    for line in raw.lines() {
        if line.is_empty() {
            continue;
        }
        if let Some(rest) = line.strip_prefix("# branch.head ") {
            branch = if rest == "(detached)" {
                Some("HEAD (detached)".into())
            } else {
                Some(rest.to_string())
            };
            continue;
        }
        if let Some(rest) = line.strip_prefix("# branch.upstream ") {
            upstream = Some(rest.to_string());
            continue;
        }
        if let Some(rest) = line.strip_prefix("# branch.ab ") {
            for token in rest.split_whitespace() {
                if let Some(n) = token.strip_prefix('+') {
                    ahead = n.parse().unwrap_or(0);
                } else if let Some(n) = token.strip_prefix('-') {
                    behind = n.parse().unwrap_or(0);
                }
            }
            continue;
        }
        if line.starts_with('#') {
            continue;
        }

        if let Some(path) = line.strip_prefix("? ") {
            files.push(GitFileEntry {
                path: path.to_string(),
                status: "?".into(),
                staged: false,
                unstaged: true,
                untracked: true,
                conflicted: false,
            });
            continue;
        }
        if line.starts_with('!') {
            continue;
        }

        let parts: Vec<&str> = line.splitn(2, ' ').collect();
        let kind = parts.first().copied().unwrap_or("");
        let rest = parts.get(1).copied().unwrap_or("");

        if kind == "1" || kind == "2" || kind == "u" {
            let mut tokens = rest.split_whitespace();
            let xy = tokens.next().unwrap_or("..");
            let chars: Vec<char> = xy.chars().collect();
            let index = chars.first().copied().unwrap_or('.');
            let worktree = chars.get(1).copied().unwrap_or('.');

            let path = if kind == "2" {
                rest.split('\t')
                    .nth(1)
                    .map(str::trim)
                    .filter(|p| !p.is_empty())
                    .unwrap_or_else(|| rest.split_whitespace().last().unwrap_or(""))
                    .to_string()
            } else {
                rest.split_whitespace()
                    .last()
                    .unwrap_or("")
                    .to_string()
            };

            if path.is_empty() {
                continue;
            }

            let conflicted = kind == "u"
                || index == 'U'
                || worktree == 'U'
                || (index == 'A' && worktree == 'A')
                || (index == 'D' && worktree == 'D');
            if conflicted {
                has_conflicts = true;
            }

            let staged = index != '.' && !conflicted;
            let unstaged = worktree != '.' || conflicted;
            let letter = if conflicted {
                "U".into()
            } else if staged {
                status_letter(index)
            } else if worktree != '.' {
                status_letter(worktree)
            } else {
                "M".into()
            };

            files.push(GitFileEntry {
                path,
                status: letter,
                staged,
                unstaged,
                untracked: false,
                conflicted,
            });
        }
    }

    GitStatusSnapshot {
        is_repo: true,
        branch,
        upstream,
        ahead,
        behind,
        has_conflicts,
        files,
    }
}

#[tauri::command]
pub fn git_status(repo_path: String) -> Result<GitStatusSnapshot, String> {
    validate_repo(&repo_path)?;

    let inside = run_git(&repo_path, &["rev-parse", "--is-inside-work-tree"])?;
    if !inside.ok || inside.stdout.trim() != "true" {
        return Ok(empty_snapshot(false));
    }

    let raw = run_git_checked(
        &repo_path,
        &[
            "status",
            "--porcelain=v2",
            "--branch",
            "--untracked-files=all",
        ],
    )?;
    Ok(parse_porcelain_v2(&raw))
}

#[tauri::command]
pub fn git_diff(
    repo_path: String,
    path: Option<String>,
    staged: bool,
) -> Result<String, String> {
    let mut args: Vec<String> = vec!["diff".into(), "--no-color".into()];
    if staged {
        args.push("--cached".into());
    }
    if let Some(p) = path.filter(|p| !p.is_empty()) {
        args.push("--".into());
        args.push(p);
    }
    let str_args: Vec<&str> = args.iter().map(String::as_str).collect();
    run_git_checked(&repo_path, &str_args)
}

#[tauri::command]
pub fn git_stage(repo_path: String, paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        run_git_checked(&repo_path, &["add", "-A"])?;
        return Ok(());
    }
    let mut args = vec!["add".to_string(), "--".to_string()];
    args.extend(paths);
    let str_args: Vec<&str> = args.iter().map(String::as_str).collect();
    run_git_checked(&repo_path, &str_args)?;
    Ok(())
}

#[tauri::command]
pub fn git_unstage(repo_path: String, paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        run_git_checked(&repo_path, &["restore", "--staged", "."])?;
        return Ok(());
    }
    let mut args = vec![
        "restore".to_string(),
        "--staged".to_string(),
        "--".to_string(),
    ];
    args.extend(paths);
    let str_args: Vec<&str> = args.iter().map(String::as_str).collect();
    run_git_checked(&repo_path, &str_args)?;
    Ok(())
}

#[tauri::command]
pub fn git_commit(repo_path: String, message: String) -> Result<GitCommandResult, String> {
    let trimmed = message.trim();
    if trimmed.is_empty() {
        return Err("commit message is required".into());
    }
    run_git(&repo_path, &["commit", "-m", trimmed])
}

#[tauri::command]
pub fn git_fetch(repo_path: String) -> Result<GitCommandResult, String> {
    run_git(&repo_path, &["fetch", "--prune"])
}

#[tauri::command]
pub fn git_pull(repo_path: String) -> Result<GitCommandResult, String> {
    run_git(&repo_path, &["pull", "--ff-only"])
}

#[tauri::command]
pub fn git_push(repo_path: String) -> Result<GitCommandResult, String> {
    run_git(&repo_path, &["push"])
}

#[tauri::command]
pub fn git_branches(repo_path: String) -> Result<Vec<GitBranchInfo>, String> {
    let local_raw = run_git_checked(
        &repo_path,
        &[
            "for-each-ref",
            "--format=%(refname:short)\t%(objectname:short)\t%(HEAD)\t%(upstream:short)",
            "refs/heads/",
        ],
    )?;
    let remote_raw = run_git_checked(
        &repo_path,
        &[
            "for-each-ref",
            "--format=%(refname:short)\t%(objectname:short)\t%(HEAD)",
            "refs/remotes/",
        ],
    )
    .unwrap_or_default();

    let mut branches = Vec::new();

    for line in local_raw.lines() {
        if line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.split('\t').collect();
        let name = parts.first().copied().unwrap_or("").to_string();
        if name.is_empty() {
            continue;
        }
        branches.push(GitBranchInfo {
            name,
            tip: parts.get(1).copied().unwrap_or("").to_string(),
            is_current: parts.get(2).copied() == Some("*"),
            is_remote: false,
            upstream: parts
                .get(3)
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .map(str::to_string),
        });
    }

    for line in remote_raw.lines() {
        if line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.split('\t').collect();
        let name = parts.first().copied().unwrap_or("").to_string();
        if name.is_empty() || name.ends_with("/HEAD") {
            continue;
        }
        branches.push(GitBranchInfo {
            name,
            tip: parts.get(1).copied().unwrap_or("").to_string(),
            is_current: false,
            is_remote: true,
            upstream: None,
        });
    }

    Ok(branches)
}

#[tauri::command]
pub fn git_checkout(
    repo_path: String,
    branch: String,
    create: bool,
) -> Result<GitCommandResult, String> {
    let trimmed = branch.trim();
    if trimmed.is_empty() {
        return Err("branch name is required".into());
    }
    if create {
        return run_git(&repo_path, &["switch", "-c", trimmed]);
    }

    if trimmed.contains('/') {
        let local = trimmed.rsplit('/').next().unwrap_or(trimmed);
        let existing = run_git(
            &repo_path,
            &[
                "show-ref",
                "--verify",
                "--quiet",
                &format!("refs/heads/{local}"),
            ],
        )?;
        if existing.ok {
            return run_git(&repo_path, &["switch", local]);
        }
        return run_git(
            &repo_path,
            &["switch", "--track", "-c", local, trimmed],
        );
    }

    run_git(&repo_path, &["switch", trimmed])
}

#[tauri::command]
pub fn git_clone(url: String, destination: String) -> Result<GitCommandResult, String> {
    let url = url.trim();
    let destination = destination.trim();
    if url.is_empty() {
        return Err("clone URL is required".into());
    }
    if destination.is_empty() {
        return Err("destination path is required".into());
    }
    if !Path::new(destination).is_absolute() {
        return Err("destination path must be absolute".into());
    }
    run_git_raw(None, &["clone", "--", url, destination])
}

#[tauri::command]
pub fn git_init(repo_path: String) -> Result<GitCommandResult, String> {
    validate_repo(&repo_path)?;
    run_git_raw(Some(&repo_path), &["init"])
}

#[tauri::command]
pub fn git_log(repo_path: String, limit: Option<u32>) -> Result<Vec<GitCommitInfo>, String> {
    let max = limit.unwrap_or(50).clamp(1, 200).to_string();
    let raw = run_git_checked(
        &repo_path,
        &[
            "log",
            &format!("--max-count={max}"),
            "--pretty=format:%H\t%h\t%an\t%ae\t%at\t%s",
        ],
    )?;

    let mut commits = Vec::new();
    for line in raw.lines() {
        if line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.splitn(6, '\t').collect();
        if parts.len() < 6 {
            continue;
        }
        commits.push(GitCommitInfo {
            hash: parts[0].to_string(),
            short_hash: parts[1].to_string(),
            author: parts[2].to_string(),
            email: parts[3].to_string(),
            timestamp: parts[4].parse().unwrap_or(0),
            subject: parts[5].to_string(),
        });
    }
    Ok(commits)
}

#[tauri::command]
pub fn git_stash_list(repo_path: String) -> Result<Vec<GitStashEntry>, String> {
    let raw = run_git_checked(
        &repo_path,
        &["stash", "list", "--format=%gd\t%gs\t%ct"],
    )?;
    let mut entries = Vec::new();
    for (index, line) in raw.lines().enumerate() {
        if line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.splitn(3, '\t').collect();
        entries.push(GitStashEntry {
            index: index as u32,
            reflog: parts.first().copied().unwrap_or("").to_string(),
            message: parts.get(1).copied().unwrap_or("").to_string(),
            timestamp: parts
                .get(2)
                .and_then(|s| s.parse().ok())
                .unwrap_or(0),
        });
    }
    Ok(entries)
}

#[tauri::command]
pub fn git_stash_push(
    repo_path: String,
    message: Option<String>,
    include_untracked: bool,
) -> Result<GitCommandResult, String> {
    let mut args = vec!["stash".to_string(), "push".to_string()];
    if include_untracked {
        args.push("-u".to_string());
    }
    if let Some(msg) = message
        .as_ref()
        .map(|m| m.trim())
        .filter(|m| !m.is_empty())
    {
        args.push("-m".to_string());
        args.push(msg.to_string());
    }
    let str_args: Vec<&str> = args.iter().map(String::as_str).collect();
    run_git(&repo_path, &str_args)
}

#[tauri::command]
pub fn git_stash_apply(
    repo_path: String,
    reflog: Option<String>,
) -> Result<GitCommandResult, String> {
    match reflog.filter(|s| !s.trim().is_empty()) {
        Some(r) => run_git(&repo_path, &["stash", "apply", r.trim()]),
        None => run_git(&repo_path, &["stash", "apply"]),
    }
}

#[tauri::command]
pub fn git_stash_pop(
    repo_path: String,
    reflog: Option<String>,
) -> Result<GitCommandResult, String> {
    match reflog.filter(|s| !s.trim().is_empty()) {
        Some(r) => run_git(&repo_path, &["stash", "pop", r.trim()]),
        None => run_git(&repo_path, &["stash", "pop"]),
    }
}

#[tauri::command]
pub fn git_stash_drop(
    repo_path: String,
    reflog: Option<String>,
) -> Result<GitCommandResult, String> {
    match reflog.filter(|s| !s.trim().is_empty()) {
        Some(r) => run_git(&repo_path, &["stash", "drop", r.trim()]),
        None => run_git(&repo_path, &["stash", "drop"]),
    }
}

#[tauri::command]
pub fn git_show(repo_path: String, revision: String) -> Result<String, String> {
    let rev = revision.trim();
    if rev.is_empty() {
        return Err("revision is required".into());
    }
    run_git_checked(
        &repo_path,
        &["show", "--no-color", "--stat", "--patch", rev],
    )
}
