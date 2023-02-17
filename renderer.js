const set_button = document.getElementById('settings_btn')
set_button.addEventListener('click', () => {
    window.electronAPI.create_settings_window();
});
const binding_button = document.getElementById('bindings_btn');
binding_button.addEventListener('click', () => {
    window.electronAPI.create_bindings_window();
});
const save_btn = document.getElementById('save_btn');
save_btn.addEventListener('click', () => {
    window.electronAPI.save_wrapper();
});