const auth_button = document.getElementById('twitch_auth_button');
auth_button.addEventListener('click', () => {
    window.electronAPI.log_message("yoyoyoyoy");
    window.electronAPI.create_auth_window();
});


const submit_button = document.getElementById('submit_auth_button');
submit_button.addEventListener('click', () => {
    let user_key = document.getElementById('user_key_field').value;
    //let username = document.getElementById('username_field').value;
    window.electronAPI.save_auth_settings(user_key);
});