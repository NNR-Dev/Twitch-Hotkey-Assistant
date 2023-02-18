const set_button = document.getElementById('settings_btn')
set_button.addEventListener('click', () => {
    window.electronAPI.create_settings_window();
});
const binding_button = document.getElementById('bindings_btn');
binding_button.addEventListener('click', () => {
    window.electronAPI.create_bindings_window();
});
const save_btn = document.getElementById('save_btn');
const feed_div = document.getElementById('text_feed');

save_btn.addEventListener('click', () => {
    window.electronAPI.save_wrapper();
});

const test_btn = document.getElementById('test_add_text_btn');
test_btn.addEventListener('click', () => {
    window.electronAPI.test_create_feed_label();
});

const start_btn = document.getElementById('start_btn');
start_btn.addEventListener('click', () => {
    window.electronAPI.start_listener();
});

function get_timestamp(){
    var currentdate = new Date();
    var datestr = "["+((currentdate.getDate() < 10)?"0":"") + currentdate.getDate() + "/"
    + (((currentdate.getMonth()+1) < 10)?"0":"") + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear() + "] "  

    
    var timestr =  ((currentdate.getHours() < 10)?"0":"") + currentdate.getHours() + ":"  
                + ((currentdate.getMinutes() < 10)?"0":"") + currentdate.getMinutes() + ":" 
                + ((currentdate.getSeconds() < 10)?"0":"") + currentdate.getSeconds() + " ";

    var datetime = datestr+timestr;
    return datetime;
}

window.electronAPI.add_feed_label((event, string) => {
    let label = document.createElement("label");
    label.setAttribute("class", "feed_label");
    label.style.color = "#DDDDDD";
    label.style.fontFamily = "Arial, Helvetica, sans-serif";
    label.innerHTML = string;

    timestamp_label = document.createElement("label");
    timestamp_label.setAttribute("class", "feed_label");
    timestamp_label.style.color = "#DDDDDD";
    timestamp_label.style.fontFamily = "Arial, Helvetica, sans-serif";
    timestamp_label.style.fontSize = "x-small"
    timestamp_label.innerHTML = get_timestamp();
    feed_div.appendChild(timestamp_label);
    feed_div.appendChild(label);
    let br = document.createElement("br");
    feed_div.appendChild(br);
})