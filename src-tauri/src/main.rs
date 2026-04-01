#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{AboutMetadataBuilder, MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
use tauri_plugin_opener::OpenerExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;

            #[allow(unused_mut)]
            let mut app_submenu = SubmenuBuilder::new(app, "Dashshund")
                .about(Some(AboutMetadataBuilder::new().build()));

            #[cfg(target_os = "windows")]
            {
                app_submenu = app_submenu.text("check-for-updates", "Check for Updates");
            }

            let app_submenu = app_submenu
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;
            let edit_submenu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;
            let links_submenu = SubmenuBuilder::new(app, "Links")
                .text("github-repo", "GitHub Repository")
                .text("latest-release", "Latest Release")
                .build()?;
            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .item(&edit_submenu)
                .item(&links_submenu)
                .build()?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "check-for-updates" => {
                let _ = app
                    .get_webview_window("main")
                    .expect("main window not found")
                    .emit("check-for-updates", ());
            }
            "github-repo" => {
                let _ = app
                    .opener()
                    .open_url("https://github.com/jonahsnider/dashshund", None::<&str>);
            }
            "latest-release" => {
                let _ = app.opener().open_url(
                    "https://github.com/jonahsnider/dashshund/releases/latest",
                    None::<&str>,
                );
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
