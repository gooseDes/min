use std::env;
use std::fs::File;
use std::io::Write;
use std::process::Command;

use futures_util::StreamExt;
use semver::Version;
use serde::Deserialize;
use tauri::image::Image;
use tauri::menu::{IconMenuItemBuilder, Menu, MenuItem, PredefinedMenuItem};
use tauri::path::BaseDirectory;
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_updater::UpdaterExt;

fn is_archlinux() -> bool {
    which::which("pacman").is_ok() && !which::which("dpkg").is_ok()
}

#[derive(Deserialize, Debug)]
struct Release {
    tag_name: String,
    assets: Vec<Asset>,
}

#[derive(Deserialize, Debug)]
struct Asset {
    name: String,
    browser_download_url: String,
}

fn ask_for_update<F, Fut>(app: AppHandle, callback: F)
where
    F: FnOnce() -> Fut + Send + 'static,
    Fut: std::future::Future<Output = ()> + Send + 'static,
{
    app.dialog()
        .message("A new version is available. Would you like to update?")
        .title("Min Desktop Update")
        .kind(MessageDialogKind::Info)
        .buttons(MessageDialogButtons::OkCancelCustom(
            String::from("Yes"),
            String::from("No"),
        ))
        .show(move |confirmed: bool| {
            if confirmed {
                let fut = callback();
                tauri::async_runtime::spawn(fut);
            }
        });
}

async fn check_for_updates(app: AppHandle) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let updater = app.updater()?;
    if let Some(update) = updater.check().await? {
        println!(
            "New update found! Current version: {}, new version: {}",
            app.package_info().version,
            update.version
        );

        if is_archlinux() {
            println!("Checking for Arch Linux update...");
            let client = reqwest::Client::builder()
                .user_agent("min-desktop")
                .build()?;

            let release: Release = client
                .get("https://api.github.com/repos/gooseDes/min-web/releases/latest")
                .send()
                .await?
                .json()
                .await?;
            let version_string: String = release.tag_name.chars().skip(5).collect();
            let version = Version::parse(&version_string).unwrap_or_else(|_| Version::new(0, 0, 0));

            if version > app.package_info().version {
                println!("Found new version: {}", version_string);
                let asset = release.assets.iter().find(|asset| {
                    asset.name.contains(".pkg.tar.zst") && !asset.name.contains("-debug-")
                });
                if let Some(asset) = asset {
                    println!("Downloading asset: {}", asset.name);
                    let dir = app.path().app_cache_dir()?;
                    let path = dir.join(asset.name.clone());
                    let response = client.get(&asset.browser_download_url).send().await?;
                    let mut file = File::create(path.clone())?;
                    let mut stream = response.bytes_stream();

                    while let Some(chunk) = stream.next().await {
                        let data = chunk?;
                        file.write_all(&data)?;
                    }

                    println!("Download completed. Installing...");
                    ask_for_update(app.clone(), move || async move {
                        match Command::new("pkexec")
                            .arg("pacman")
                            .arg("-U")
                            .arg(path.clone())
                            .arg("--noconfirm")
                            .output()
                        {
                            Ok(output) => {
                                if output.status.success() {
                                    println!("Installed successfully! Restarting...");
                                    app.restart();
                                } else {
                                    println!(
                                        "Failed to install: {}",
                                        String::from_utf8_lossy(&output.stderr)
                                    );
                                }
                            }
                            Err(e) => println!("Failed to install: {}", e),
                        }
                    });
                } else {
                    println!("No matching asset found.");
                }
            } else {
                println!(
                    "No newer version available. Current version: {}, latest version: {}",
                    app.package_info().version,
                    version
                );
            }
        } else {
            ask_for_update(app.clone(), move || async move {
                let mut downloaded = 0;

                if let Err(e) = update
                    .download_and_install(
                        move |chunk_length, total_length| {
                            downloaded += chunk_length;
                            if let Some(total) = total_length {
                                let percentage = (downloaded as f64 / total as f64) * 100.0;
                                println!("Download progress: {:.2}%", percentage);
                            }
                        },
                        move || {
                            println!("Download finished! Applying update...");
                        },
                    )
                    .await
                {
                    eprintln!("Failed to download and install update: {}", e);
                } else {
                    println!("Update installed successfully! Restarting application...");
                    app.restart();
                }
            });
        }
    } else {
        println!("No update available.");
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();

                let _ = window.hide();
            }
        })
        .setup(|app| {
            #[cfg(target_os = "linux")]
            {
                app.handle()
                    .plugin(tauri_plugin_notification::init())
                    .unwrap();
            }

            let handle = app.handle();

            // Check for args
            let args: Vec<String> = env::args().collect();
            let start_hidden = args.iter().any(|a| a == "--hidden");

            // Show the window if not hidden
            if let Some(window) = app.get_webview_window("main") {
                if !start_hidden {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }

            let updater_handle = handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = check_for_updates(updater_handle).await {
                    eprintln!("Failed to check or apply update: {}", err);
                }
            });

            let app_icon = app.default_window_icon().unwrap().clone();

            let label = IconMenuItemBuilder::with_id("label", "Min Desktop")
                .icon(app_icon)
                .enabled(false)
                .build(handle)?;
            let separator = PredefinedMenuItem::separator(handle)?;
            let show_i = MenuItem::with_id(app, "show", "Show App", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide App", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&label, &separator, &show_i, &hide_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(
                    Image::from_path(
                        app.path()
                            .resolve("assets/tray.png", BaseDirectory::Resource)
                            .expect("Failed to resolve tray icon path"),
                    )
                    .expect("Failed to load tray icon"),
                )
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            #[cfg(desktop)]
            {
                let autostart_manager = app.autolaunch();
                let _ = autostart_manager.enable();
                println!(
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap()
                );
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
