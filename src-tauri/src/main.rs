#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{AboutMetadataBuilder, MenuBuilder, SubmenuBuilder};
use tauri_plugin_opener::OpenerExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

            let app_submenu = SubmenuBuilder::new(app, "Dashshund")
                .about(Some(AboutMetadataBuilder::new().build()))
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
            "github-repo" => {
                let _ = app
                    .opener()
                    .open_url("https://github.com/team581/dashshund", None::<&str>);
            }
            "latest-release" => {
                let _ = app.opener().open_url(
                    "https://github.com/team581/dashshund/releases/latest",
                    None::<&str>,
                );
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
