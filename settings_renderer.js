const auth_button = document.getElementById('twitch_auth_button');
auth_button.addEventListener('click', () => {
    window.electronAPI.log_message("yoyoyoyoy");
    window.electronAPI.create_auth_window();
});

const warning_label = document.getElementById("auth_warning_lbl");

const bind_panel_btn = document.getElementById('bind_nav');
const misc_panel_btn = document.getElementById('settings_nav');
const about_panel_btn = document.getElementById('about_nav');
const saving_info_lbl = document.getElementById('saving_info_lbl');

bind_panel_btn.addEventListener('click', () => {
    save_user_settings("bind");
});

misc_panel_btn.addEventListener('click', () => {
    save_user_settings("misc");
})

about_panel_btn.addEventListener('click', () => {
    save_user_settings("about");
})

window.electronAPI.save_current_window((event) => {
    save_user_settings("close");
});

window.electronAPI.show_save_lbl((event, can_show) => {
    if (can_show){
        saving_info_lbl.style.display = 'block';
    } else {
        saving_info_lbl.style.display = 'none';
    }
});

window.electronAPI.save_callback((event, callback_name) => {
    if (callback_name === "about"){
        window.electronAPI.open_about_window();
    } else if (callback_name === "misc"){
        window.electronAPI.open_misc_window();
    } else if (callback_name === "close"){
        window.electronAPI.close_setting_window();
    } else if (callback_name === "bind"){
        window.electronAPI.create_bindings_window("settings");
    }
});


// // // const submit_button = document.getElementById('submit_auth_button');
// // // submit_button.addEventListener('click', () => {
// // //     save_user_settings();
// // // });

function save_user_settings(callback_name){
    let user_key = document.getElementById('user_key_field').value;
    window.electronAPI.log_message("User key: "+user_key);
    //let username = document.getElementById('username_field').value;
    window.electronAPI.save_auth_settings(user_key, callback_name);
    //hide_warn_label(user_key !== "");
}

function hide_warn_label(hide){
    if (hide){
        warning_label.style.display = 'none';
    } else {
        warning_label.style.display = 'block';
    }
}

window.electronAPI.get_auth_key((event, key) => {
    document.getElementById('user_key_field').value = key;
    //hide_warn_label(key !== "");
});