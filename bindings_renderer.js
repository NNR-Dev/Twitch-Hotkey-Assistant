//var ipcRenderer = require('electron').ipcRenderer;
var rewards = []

// names of known key codes (0-255)

var keyboardMap = [
    "", // [0]
    "", // [1]
    "", // [2]
    "CANCEL", // [3]
    "", // [4]
    "", // [5]
    "HELP", // [6]
    "", // [7]
    "BACK_SPACE", // [8]
    "TAB", // [9]
    "", // [10]
    "", // [11]
    "CLEAR", // [12]
    "ENTER", // [13]
    "ENTER_SPECIAL", // [14]
    "", // [15]
    "SHIFT", // [16]
    "CONTROL", // [17]
    "ALT", // [18]
    "PAUSE", // [19]
    "CAPS_LOCK", // [20]
    "KANA", // [21]
    "EISU", // [22]
    "JUNJA", // [23]
    "FINAL", // [24]
    "HANJA", // [25]
    "", // [26]
    "ESCAPE", // [27]
    "CONVERT", // [28]
    "NONCONVERT", // [29]
    "ACCEPT", // [30]
    "MODECHANGE", // [31]
    "SPACE", // [32]
    "PAGE_UP", // [33]
    "PAGE_DOWN", // [34]
    "END", // [35]
    "HOME", // [36]
    "LEFT", // [37]
    "UP", // [38]
    "RIGHT", // [39]
    "DOWN", // [40]
    "SELECT", // [41]
    "PRINT", // [42]
    "EXECUTE", // [43]
    "PRINTSCREEN", // [44]
    "INSERT", // [45]
    "DELETE", // [46]
    "", // [47]
    "0", // [48]
    "1", // [49]
    "2", // [50]
    "3", // [51]
    "4", // [52]
    "5", // [53]
    "6", // [54]
    "7", // [55]
    "8", // [56]
    "9", // [57]
    "COLON", // [58]
    "SEMICOLON", // [59]
    "LESS_THAN", // [60]
    "EQUALS", // [61]
    "GREATER_THAN", // [62]
    "QUESTION_MARK", // [63]
    "AT", // [64]
    "A", // [65]
    "B", // [66]
    "C", // [67]
    "D", // [68]
    "E", // [69]
    "F", // [70]
    "G", // [71]
    "H", // [72]
    "I", // [73]
    "J", // [74]
    "K", // [75]
    "L", // [76]
    "M", // [77]
    "N", // [78]
    "O", // [79]
    "P", // [80]
    "Q", // [81]
    "R", // [82]
    "S", // [83]
    "T", // [84]
    "U", // [85]
    "V", // [86]
    "W", // [87]
    "X", // [88]
    "Y", // [89]
    "Z", // [90]
    "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
    "", // [92]
    "CONTEXT_MENU", // [93]
    "", // [94]
    "SLEEP", // [95]
    "NUMPAD0", // [96]
    "NUMPAD1", // [97]
    "NUMPAD2", // [98]
    "NUMPAD3", // [99]
    "NUMPAD4", // [100]
    "NUMPAD5", // [101]
    "NUMPAD6", // [102]
    "NUMPAD7", // [103]
    "NUMPAD8", // [104]
    "NUMPAD9", // [105]
    "MULTIPLY", // [106]
    "ADD", // [107]
    "SEPARATOR", // [108]
    "SUBTRACT", // [109]
    "DECIMAL", // [110]
    "DIVIDE", // [111]
    "F1", // [112]
    "F2", // [113]
    "F3", // [114]
    "F4", // [115]
    "F5", // [116]
    "F6", // [117]
    "F7", // [118]
    "F8", // [119]
    "F9", // [120]
    "F10", // [121]
    "F11", // [122]
    "F12", // [123]
    "F13", // [124]
    "F14", // [125]
    "F15", // [126]
    "F16", // [127]
    "F17", // [128]
    "F18", // [129]
    "F19", // [130]
    "F20", // [131]
    "F21", // [132]
    "F22", // [133]
    "F23", // [134]
    "F24", // [135]
    "", // [136]
    "", // [137]
    "", // [138]
    "", // [139]
    "", // [140]
    "", // [141]
    "", // [142]
    "", // [143]
    "NUM_LOCK", // [144]
    "SCROLL_LOCK", // [145]
    "WIN_OEM_FJ_JISHO", // [146]
    "WIN_OEM_FJ_MASSHOU", // [147]
    "WIN_OEM_FJ_TOUROKU", // [148]
    "WIN_OEM_FJ_LOYA", // [149]
    "WIN_OEM_FJ_ROYA", // [150]
    "", // [151]
    "", // [152]
    "", // [153]
    "", // [154]
    "", // [155]
    "", // [156]
    "", // [157]
    "", // [158]
    "", // [159]
    "CIRCUMFLEX", // [160]
    "EXCLAMATION", // [161]
    "DOUBLE_QUOTE", // [162]
    "HASH", // [163]
    "DOLLAR", // [164]
    "PERCENT", // [165]
    "AMPERSAND", // [166]
    "UNDERSCORE", // [167]
    "OPEN_PAREN", // [168]
    "CLOSE_PAREN", // [169]
    "ASTERISK", // [170]
    "PLUS", // [171]
    "PIPE", // [172]
    "HYPHEN_MINUS", // [173]
    "OPEN_CURLY_BRACKET", // [174]
    "CLOSE_CURLY_BRACKET", // [175]
    "TILDE", // [176]
    "", // [177]
    "", // [178]
    "", // [179]
    "", // [180]
    "VOLUME_MUTE", // [181]
    "VOLUME_DOWN", // [182]
    "VOLUME_UP", // [183]
    "", // [184]
    "", // [185]
    "SEMICOLON", // [186]
    "EQUALS", // [187]
    "COMMA", // [188]
    "MINUS", // [189]
    "PERIOD", // [190]
    "SLASH", // [191]
    "BACK_QUOTE", // [192]
    "", // [193]
    "", // [194]
    "", // [195]
    "", // [196]
    "", // [197]
    "", // [198]
    "", // [199]
    "", // [200]
    "", // [201]
    "", // [202]
    "", // [203]
    "", // [204]
    "", // [205]
    "", // [206]
    "", // [207]
    "", // [208]
    "", // [209]
    "", // [210]
    "", // [211]
    "", // [212]
    "", // [213]
    "", // [214]
    "", // [215]
    "", // [216]
    "", // [217]
    "", // [218]
    "OPEN_BRACKET", // [219]
    "BACK_SLASH", // [220]
    "CLOSE_BRACKET", // [221]
    "QUOTE", // [222]
    "", // [223]
    "META", // [224]
    "ALTGR", // [225]
    "", // [226]
    "WIN_ICO_HELP", // [227]
    "WIN_ICO_00", // [228]
    "", // [229]
    "WIN_ICO_CLEAR", // [230]
    "", // [231]
    "", // [232]
    "WIN_OEM_RESET", // [233]
    "WIN_OEM_JUMP", // [234]
    "WIN_OEM_PA1", // [235]
    "WIN_OEM_PA2", // [236]
    "WIN_OEM_PA3", // [237]
    "WIN_OEM_WSCTRL", // [238]
    "WIN_OEM_CUSEL", // [239]
    "WIN_OEM_ATTN", // [240]
    "WIN_OEM_FINISH", // [241]
    "WIN_OEM_COPY", // [242]
    "WIN_OEM_AUTO", // [243]
    "WIN_OEM_ENLW", // [244]
    "WIN_OEM_BACKTAB", // [245]
    "ATTN", // [246]
    "CRSEL", // [247]
    "EXSEL", // [248]
    "EREOF", // [249]
    "PLAY", // [250]
    "ZOOM", // [251]
    "", // [252]
    "PA1", // [253]
    "WIN_OEM_CLEAR", // [254]
    "" // [255]
  ];

// ipcRenderer.on('rewards-list', function (event,store) {
//     rewards = store;
// });

var hotkey_bind_dict = {};
var hotkey_duration_dict = {};

document.addEventListener("keydown", listen_for_key);
//rewards = await window.electronAPI.get_rewards()
const scrollable_div = document.getElementById('scrollable');
var bind_count = 0;
window.electronAPI.get_rewards((event, value) => {
    rewards = value;
})

window.electronAPI.get_hotkey_dicts((event, bind_dict, duration_dict) => {
    hotkey_bind_dict = bind_dict;
    hotkey_duration_dict = duration_dict;
    load_binding_panels();
})

//spaghetti courtesy of https://stackoverflow.com/a/24457420
function isNumeric(value) {
    return /^\d+$/.test(value);
}

function load_binding_panels(){
    window.electronAPI.log_message("starting loading");
    for (const [key, values] of Object.entries(hotkey_bind_dict)){
        duration = hotkey_duration_dict[key];
        values.forEach(value => {        
            let new_div = create_binding_panel();
            var reward_selecter = new_div.querySelector(".reward_selecter")
            change_selecter_value(key, reward_selecter);
            var duration_field = new_div.querySelector(".duration_field");
            if (duration == "0"){
                duration_field.value = "";
            } else {
                duration_field.value = duration;
            }
            btn = new_div.querySelector(".bind_button")
            if (value === "key_empty" || value === ""){
                btn.value = "key_empty";
                btn.innerHTML = "Click to Bind";
            } else {
                btn.value = value;
                btn.innerHTML = value;
            }
            
        });

    }
}

function change_selecter_value(value, select){
    window.electronAPI.log_message("changing val");
    const $options = Array.from(select.options);
    const optionToSelect = $options.find(item => item.text ===value);
    select.value = optionToSelect.value;
    window.electronAPI.log_message("val changed");
  };

function listen_for_key(e){
    window.electronAPI.log_message(e.target.className);
    if (e.target.className === 'bind_button'){
        var keynum;
        //window.electronAPI.log_message("bababababababababa");
        e.preventDefault();
        //window.electronAPI.log_message(bind_button_id);
        if(window.event) { // IE                  
        keynum = e.keyCode;
        window.electronAPI.log_message("kejycode");
        } else if(e.which){ // Netscape/Firefox/Opera                 
        keynum = e.which;
        }
        window.electronAPI.log_message("peepo");
        keynum = keyboardMap[keynum];
        button_ref = e.target;
        button_ref.value=keynum;
        button_ref.innerHTML=keynum;
        body_node=document.getElementById("body");
        body_node.focus();
        //utilityProcess.
    }
  }


function get_binding_data(){
    hotkey_bind_dict = {}
    hotkey_duration_dict = {}
    let divs = document.querySelectorAll(".bind_div");
    window.electronAPI.log_message(divs.length);
    for (let node of divs){
        let selecter = node.querySelector(".reward_selecter");
        let selected_reward = selecter.value;
        window.electronAPI.log_message(selected_reward);
        let duration_field = node.querySelector(".duration_field");
        let bind_duration = duration_field.value;
        bind_duration = isNumeric(bind_duration) ? bind_duration : 0;
        window.electronAPI.log_message(bind_duration);
        let bind_button = node.querySelector(".bind_button");
        let bind_key = bind_button.value;
        window.electronAPI.log_message(bind_key);
        if (!(selected_reward in hotkey_bind_dict)){
            hotkey_bind_dict[selected_reward] = [bind_key];
            hotkey_duration_dict[selected_reward] = bind_duration;
        } else {
            bind_list = hotkey_bind_dict[selected_reward];
            bind_list.push(bind_key);
            hotkey_bind_dict[selected_reward] = bind_list;
        }
    }
    window.electronAPI.send_hotkey_dicts(hotkey_bind_dict, hotkey_duration_dict);
}

function create_binding_panel(){
    //window.electronAPI.log_message(rewards);
    var new_div = document.createElement("div");
    new_div.setAttribute("class", "bind_div");
    new_div.setAttribute("style", "margin-bottom:0.2cm;")

    let selecter = document.createElement("select");
    selecter.setAttribute("class", "reward_selecter");
    //selecter.setAttribute("width", 300);
    new_div.appendChild(selecter);
    rewards.forEach(element => {
        temp_option = document.createElement("option");
        temp_option.value=element;
        temp_option.textContent=element;
        selecter.appendChild(temp_option);
    });
    let duration_field = document.createElement("input");
    duration_field.setAttribute("type", "text");
    duration_field.setAttribute("class", "duration_field");
    new_div.appendChild(duration_field);

    let bind_button = document.createElement("button");
    bind_button.setAttribute("class", "bind_button");
    bind_button.innerHTML ="Click to Bind";
    bind_button.setAttribute("value", "key_empty");
    let bind_button_id = "bind_btn_"+bind_count;
    window.electronAPI.log_message(bind_button_id);
    bind_count++;
    bind_button.setAttribute("id", bind_button_id);
    bind_button.setAttribute("keydown", "myKeyPress(event)");
    new_div.appendChild(bind_button);

    scrollable_div.appendChild(new_div);
    return new_div;
    
}

// auth_button.addEventListener('click', () => {
//     window.electronAPI.log_message("yoyoyoyoy");
//     window.electronAPI.create_auth_window();
// });
