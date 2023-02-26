const save_btn = document.getElementById('save_settings_btn');
save_btn.addEventListener('click', () => {
    save_misc_settings();
});
const user_panel_btn = document.getElementById('user_nav');
const bind_panel_btn = document.getElementById('bind_nav');
const save_bind_btn = document.getElementById("save_bind_button");
function save_misc_settings(){
    let timestamp_setting = get_radio_val("timestamp_radio_group");
    window.electronAPI.log_message(timestamp_setting);
    window.electronAPI.save_misc_settings(timestamp_setting);
}

//set_radio_val("timestamp_radio_group", "time");

bind_panel_btn.addEventListener('click', () => {
    save_misc_settings();
    window.electronAPI.create_bindings_window();
})

user_panel_btn.addEventListener('click', () => {
    save_misc_settings();
    window.electronAPI.open_settings_window();
})

function get_radio_val(name) {
    var ele = document.getElementsByName(name);
      
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked){
            window.electronAPI.log_message("type:"+ele[i].value);
            return String(ele[i].value);
        }
    }
   
}

function set_radio_val(name, val) {
    var ele = document.getElementsByName(name);
    for(i = 0; i < ele.length; i++) {
        if(ele[i].value === val){
            ele[i].checked = true;
        }
    }
}

window.electronAPI.get_misc_settings((event, timestamp_type) => {
    set_radio_val("timestamp_radio_group", timestamp_type);
})