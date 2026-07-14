mod git;
mod terminal;

use git::{
    git_branches, git_checkout, git_clone, git_commit, git_diff, git_fetch, git_init, git_log,
    git_pull, git_push, git_show, git_stage, git_stash_apply, git_stash_drop, git_stash_list,
    git_stash_pop, git_stash_push, git_status, git_unstage,
};
use terminal::{
    terminal_create, terminal_kill, terminal_list_shells, terminal_resize, terminal_write,
    PtyManager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_window_state::Builder::new()
                // Avoid restoring visibility — a saved "hidden" window paints as a black frame on macOS.
                .with_state_flags(
                    tauri_plugin_window_state::StateFlags::SIZE
                        | tauri_plugin_window_state::StateFlags::POSITION
                        | tauri_plugin_window_state::StateFlags::MAXIMIZED
                        | tauri_plugin_window_state::StateFlags::FULLSCREEN,
                )
                .build(),
        )
        .manage(PtyManager::new())
        .invoke_handler(tauri::generate_handler![
            terminal_create,
            terminal_write,
            terminal_resize,
            terminal_kill,
            terminal_list_shells,
            git_status,
            git_diff,
            git_stage,
            git_unstage,
            git_commit,
            git_fetch,
            git_pull,
            git_push,
            git_branches,
            git_checkout,
            git_clone,
            git_init,
            git_log,
            git_stash_list,
            git_stash_push,
            git_stash_apply,
            git_stash_pop,
            git_stash_drop,
            git_show,
        ])
        .setup(|app| {
            use tauri::Manager;

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running LaunchOS");
}
