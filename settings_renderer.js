const auth_button = document.getElementById('twitch_auth_button');
auth_button.addEventListener('click', () => {
    window.electronAPI.log_message("yoyoyoyoy");
    window.electronAPI.create_auth_window();
});

const bind_panel_btn = document.getElementById('bind_nav');

bind_panel_btn.addEventListener('click', () => {
    save_user_settings();
    window.electronAPI.create_bindings_window();
})

const submit_button = document.getElementById('submit_auth_button');
submit_button.addEventListener('click', () => {
    save_user_settings();
});

function save_user_settings(){
    let user_key = document.getElementById('user_key_field').value;
    //let username = document.getElementById('username_field').value;
    window.electronAPI.save_auth_settings(user_key);
}

window.electronAPI.get_auth_key((event, key) => {
    document.getElementById('user_key_field').value = key;
})