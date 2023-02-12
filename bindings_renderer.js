//var ipcRenderer = require('electron').ipcRenderer;
var rewards = []

// ipcRenderer.on('rewards-list', function (event,store) {
//     rewards = store;
// });

//rewards = await window.electronAPI.get_rewards()
const scrollable_div = document.getElementById('scrollable');

window.electronAPI.get_rewards((event, value) => {
    rewards = value;
})



function create_binding_panel(){
    window.electronAPI.log_message(rewards);
    new_div = document.createElement("div");
    new_div.setAttribute("class", "bind_div");

    selecter = document.createElement("select");
    selecter.setAttribute("class", "reward_selecter");
    //selecter.setAttribute("width", 300);
    new_div.appendChild(selecter);
    rewards.forEach(element => {
        temp_option = document.createElement("option");
        temp_option.value=element;
        temp_option.textContent=element;
        selecter.appendChild(temp_option);
    });
    duration_field = document.createElement("input");
    duration_field.setAttribute("type", "text");
    duration_field.setAttribute("class", "duration_field");
    new_div.appendChild(duration_field);

    bind_button = document.createElement("button");
    bind_button.setAttribute("class", "bind_button");
    bind_button.innerHTML ="Click to Bind";
    new_div.appendChild(bind_button);

    scrollable_div.appendChild(new_div);
}

auth_button.addEventListener('click', () => {
    window.electronAPI.log_message("yoyoyoyoy");
    window.electronAPI.create_auth_window();
});
