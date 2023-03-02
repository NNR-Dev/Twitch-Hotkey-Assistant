const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    log_message: (msg) => ipcRenderer.send('log-message', msg),
    create_settings_window: () => ipcRenderer.send("create-settings-window"),
    create_auth_window: () => ipcRenderer.send("create-auth-window"),
    save_auth_settings: (user_key, callback_name) => ipcRenderer.send("save-auth-settings", user_key, callback_name),
    create_bindings_window: (sender) => ipcRenderer.send("create-bindings-window", sender),
    send_hotkey_dicts: (bind_dict, duration_dict, default_bind) => ipcRenderer.send("send-hotkey-dicts", bind_dict, duration_dict, default_bind),
    get_rewards: (msg) => ipcRenderer.on('custom-rewards', msg),
    get_hotkey_dicts: (bind_dict, duration_dict, default_bind) => ipcRenderer.on('get-hotkey-dicts', bind_dict, duration_dict, default_bind),
    get_auth_key: (key) => ipcRenderer.on('get-auth-key', key),
    add_feed_label: (string, timestamp_type) => ipcRenderer.on('add-feed-label', string, timestamp_type),
    test_create_feed_label: () => ipcRenderer.send("test-create-feed-label"),
    save_wrapper: () => ipcRenderer.send("save-wrapper"),
    start_listener: () => ipcRenderer.send("start-listener"),
    stop_listener: () => ipcRenderer.send("stop-listener"),
    open_settings_window: () => ipcRenderer.send("open-settings-window"),
    close_window: () => ipcRenderer.send("close-window"),
    save_misc_settings: (timestamp_type) => ipcRenderer.send("save-misc-settings", timestamp_type),
    get_misc_settings: (timestamp_type) => ipcRenderer.on("get-misc-settings", timestamp_type),
    open_misc_window: () => ipcRenderer.send("open-misc-window"),
    save_current_window: (event) => ipcRenderer.on("save-current-window", event),
    close_setting_window: () => ipcRenderer.send("close-setting-window"),
    open_about_window: () => ipcRenderer.send("open-about-window"),
    get_version_data: (version_number) => ipcRenderer.on('get-version-data', version_number),
    set_feed_button: (is_started) => ipcRenderer.on('set-feed-button', is_started),
    show_save_lbl: (can_show) => ipcRenderer.on("show-save-lbl", can_show),
    save_callback: (callback_name) => ipcRenderer.on("save-callback", callback_name),
    refresh_rewards: () => ipcRenderer.send("refresh-rewards",),
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  });