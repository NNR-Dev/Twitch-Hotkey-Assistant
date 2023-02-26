const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    log_message: (msg) => ipcRenderer.send('log-message', msg),
    create_settings_window: () => ipcRenderer.send("create-settings-window"),
    create_auth_window: () => ipcRenderer.send("create-auth-window"),
    save_auth_settings: (user_key) => ipcRenderer.send("save-auth-settings", user_key),
    create_bindings_window: () => ipcRenderer.send("create-bindings-window"),
    send_hotkey_dicts: (bind_dict, duration_dict, default_bind) => ipcRenderer.send("send-hotkey-dicts", bind_dict, duration_dict, default_bind),
    get_rewards: (msg) => ipcRenderer.on('custom-rewards', msg),
    get_hotkey_dicts: (bind_dict, duration_dict, default_bind) => ipcRenderer.on('get-hotkey-dicts', bind_dict, duration_dict, default_bind),
    get_auth_key: (key) => ipcRenderer.on('get-auth-key', key),
    add_feed_label: (string) => ipcRenderer.on('add-feed-label', string),
    test_create_feed_label: () => ipcRenderer.send("test-create-feed-label"),
    save_wrapper: () => ipcRenderer.send("save-wrapper"),
    start_listener: () => ipcRenderer.send("start-listener"),
    stop_listener: () => ipcRenderer.send("stop-listener"),
    open_settings_window: () => ipcRenderer.send("open-settings-window"),
    close_window: () => ipcRenderer.send("close-window"),
    save_misc_settings: (timestamp_type) => ipcRenderer.send("save-misc-settings", timestamp_type),
    get_misc_settings: (timestamp_type) => ipcRenderer.on("get-misc-settings", timestamp_type),
    open_misc_window: () => ipcRenderer.send("open-misc-window"),
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  });