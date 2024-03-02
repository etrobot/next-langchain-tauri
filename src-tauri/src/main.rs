// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  Builder,
  api::process::Command,
  generate_context,
};

fn main() {
    Builder::default()
        .setup(|_app| {
            let _ = Command::new_sidecar("server")
            .expect("failed to create `my-sidecar` binary command")
            .spawn()
            .expect("Failed to spawn sidecar");
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}