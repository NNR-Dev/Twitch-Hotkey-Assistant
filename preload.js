const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    log_message: (msg) => ipcRenderer.send('log-message', msg),
    create_settings_window: () => ipcRenderer.send("create-settings-window"),
    create_auth_window: () => ipcRenderer.send("create-auth-window"),
    save_auth_settings: (user_key, username) => ipcRenderer.send("save-auth-settings", user_key, username),
    create_bindings_window: () => ipcRenderer.send("create-bindings-window"),
    send_hotkey_dicts: (bind_dict, duration_dict) => ipcRenderer.send("send-hotkey-dicts", bind_dict, duration_dict),
    get_rewards: (msg) => ipcRenderer.on('custom-rewards', msg),
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  });