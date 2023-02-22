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
const stop_btn = document.getElementById('stop_btn');
stop_btn.style.display="none";
start_btn.addEventListener('click', () => {
    window.electronAPI.start_listener();
    start_btn.style.display="none";
    stop_btn.style.display="inline";
});

// // // stop_btn.addEventListener('click', () => {
// // //     window.electronAPI.stop_listener();
// // //     start_btn.style.display="inline";
// // //     stop_btn.style.display="none";
// // // });

function get_timestamp(){
    var currentdate = new Date();
    var datestr = "["+((currentdate.getDate() < 10)?"0":"") + currentdate.getDate() + "/"
    + (((currentdate.getMonth()+1) < 10)?"0":"") + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear() + "] "  

    
    var timestr =  ((currentdate.getHours() < 10)?"0":"") + currentdate.getHours() + ":"  
                + ((currentdate.getMinutes() < 10)?"0":"") + currentdate.getMinutes() + ":" 
                + ((currentdate.getSeconds() < 10)?"0":"") + currentdate.getSeconds() + " ";

    var datetime = timestr+"       ";
    return datetime;
}

window.electronAPI.add_feed_label((event, string) => {
    let scroll_to_bottom = false;
    if (feed_div.scrollTop === (feed_div.scrollHeight - feed_div.offsetHeight)){
        scroll_to_bottom = true;
    }
    let label = document.createElement("label");
    label.setAttribute("class", "feed_label");
    label.style.color = "#DDDDDD";
    label.style.fontFamily = "Arial, Helvetica, sans-serif";
    label.style.fontSize = "small";
    label.innerHTML = string;

    timestamp_label = document.createElement("label");
    timestamp_label.setAttribute("class", "feed_label");
    timestamp_label.style.color = "#DDDDDD";
    timestamp_label.style.fontFamily = "Arial, Helvetica, sans-serif";
    timestamp_label.style.fontSize = "x-small";
    timestamp_label.style.padding = "0px 0px";
    timestamp_label.innerHTML = get_timestamp();
    feed_div.appendChild(timestamp_label);
    feed_div.appendChild(label);
    let br = document.createElement("br");
    feed_div.appendChild(br);
    
    //var elem = document.getElementById('data');
    if (scroll_to_bottom){
        feed_div.scrollTop = feed_div.scrollHeight;
    }
})