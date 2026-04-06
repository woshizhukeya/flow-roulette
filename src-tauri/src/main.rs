#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WindowEvent};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState};
use tauri::menu::{Menu, MenuItem};

#[tauri::command]
async fn start_focus_window(app: tauri::AppHandle) {
    let timer_window = app.get_webview_window("timer").unwrap();
    timer_window.show().unwrap();
    timer_window.set_always_on_top(true).unwrap();
    timer_window.center().unwrap();
    timer_window.set_focus().unwrap();
}

#[tauri::command]
async fn back_to_main(app: tauri::AppHandle) {
    let main_window = app.get_webview_window("main").unwrap();
    let timer_window = app.get_webview_window("timer").unwrap();

    timer_window.hide().unwrap();
    main_window.show().unwrap();
    main_window.set_focus().unwrap();
}

#[tauri::command]
async fn drag_timer_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("timer") {
        let _ = window.start_dragging();
    }
}

#[tauri::command]
async fn hide_timer_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("timer") {
        let _ = window.hide();
    }
}

#[tauri::command]
async fn resize_timer_window(app: tauri::AppHandle, scale: f64) {
    if let Some(window) = app.get_webview_window("timer") {
        let base_size = 350.0;
        let new_size = base_size * scale;
        let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize::new(new_size, new_size)));
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                // If the main window tries to close, hide it instead.
                if window.label() == "main" {
                    window.hide().unwrap();
                    api.prevent_close();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            start_focus_window, 
            back_to_main,
            drag_timer_window,
            hide_timer_window,
            resize_timer_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}