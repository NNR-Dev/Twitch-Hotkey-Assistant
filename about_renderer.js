
const user_panel_btn = document.getElementById('user_nav');
const bind_panel_btn = document.getElementById('bind_nav');
const misc_panel_btn = document.getElementById('settings_nav');

const version_lbl = document.getElementById('version_lbl');

bind_panel_btn.addEventListener('click', () => {
    window.electronAPI.create_bindings_window();
})

user_panel_btn.addEventListener('click', () => {
    window.electronAPI.open_settings_window();
})

misc_panel_btn.addEventListener('click', () => {
    window.electronAPI.open_misc_window();
})

window.electronAPI.get_version_data((event, version_number) => {
    version_lbl.innerHTML = "Current software version: " + String(version_number);
});

window.electronAPI.save_current_window((event) => {
    window.electronAPI.close_setting_window();
})
