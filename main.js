class TwitchConnectionInfo {
  constructor(app_id, user_key, user_id, username, session_id, subscription_type, reward_list, key_obtained_time){
    this.app_id = app_id
    this.user_key = user_key
    this.user_id = user_id
    this.username = username
    this.session_id = session_id
    this.subscription_type = subscription_type
    this.reward_list = reward_list
    this.key_obtained_time = key_obtained_time
  }
}
var windows = new Set();
// var key_name_to_code = {
//   "f1": Key.f1,
//   "f2": Key.f2,
//   "f3": Key.f3,
//   "f4": Key.f4,
//   "f5": Key.f5,
//   "f6": Key.f6,
//   "f7": Key.f7,
//   "f8": Key.f8,
//   "f9": Key.f9,
//   "f10": Key.f10,
//   "f11": Key.f11,
//   "f12": Key.f12,
// }

var twitch_connection_info = new TwitchConnectionInfo(app_id="snbnlpo27abzy10fsg82bqqly26f80", user_key=null, user_id=null, username=null, session_id=null, subscription_type=null,
reward_list=null, key_obtained_time=null);
var settings_window;
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const axios = require('axios');
const { create } = require('domain')
const createWindow = (html_path, width = 800, height = 600, is_resizable = true) => {
    const win = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
      resizable: is_resizable,
    });
    windows.add(win);
  
    win.loadFile(html_path);
    return win;
  }

  app.whenReady().then(() => {
    ipcMain.on('log-message', log_message);
    ipcMain.on("create-settings-window", create_settings_window);
    ipcMain.on("create-auth-window", create_auth_window);
    ipcMain.on("save-auth-settings", save_auth_settings);
    ipcMain.on("create-bindings-window", create_bindings_window);
    createWindow("index.html");
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow("index.html");
      }
    });
  });
  

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
function log_message(event, msg){
  console.log(msg);
}

function check_user_token_expiry(user_token){
  let url = "https://id.twitch.tv/oauth2/validate"
  let config = {
    headers: {
      'Authorization': `Bearer ${twitch_connection_info.user_key}`
    }
  }
  axios.get(url, config).then((response) => {
    
    if (response.status == 200){
      console.log(response);
      let expiry_time = response.data.expires_in;
      console.log(expiry_time);
      if (expiry_time < 2*86400){
        dialog.showMessageBox(options={title: 'Key Expires Soon', message:'User key will expire soon. Consider generating a new user key.', type:'warning'})
      }
      return
    } else{
      dialog.showMessageBox(options={title: 'Error', message: 'User key invalid! Are you sure you entered your user key correctly?', type:'error'});
      return -1;
    }
  });
}

function save_auth_settings(event, user_key, username){
  twitch_connection_info.user_key = user_key;
  let token_expiry_time = check_user_token_expiry(user_key);
  retrieve_user_id(username);
  settings_window.close();
}

function retrieve_user_id(username){
  // let req = new XMLHttpRequest();
  let url = "https://api.twitch.tv/helix/users?login="+username;
  console.log(`Bearer ${twitch_connection_info.user_key}`);
  let config = {
    headers: {
      'Authorization': `Bearer ${twitch_connection_info.user_key}`,
      'Client-Id': twitch_connection_info.app_id
    }
  };
  axios.get(url, config).then((response) => {
      console.log(response.data);
      twitch_connection_info.user_id=response.data.data[0].id;
      console.log(twitch_connection_info.user_id);
    });
  
}

function create_bindings_window(){
  bindings_window = createWindow("bind_settings.html", 400, 600, false);
  bindings_window.setMenu(null);
}

function create_auth_window(){
  var redirect_url = "https://okactuallyrob.github.io/Twitch-Authenticator/";
  var auth_url = "https://id.twitch.tv/oauth2/authorize?client_id=" + twitch_connection_info.app_id + "&redirect_uri="+encodeURIComponent(redirect_url) + "&response_type=token&scope=channel:read:redemptions";
  w = createWindow("index.html");
  w.loadURL(auth_url);
}

function create_settings_window(){
  settings_window = createWindow("settings.html", 400, 207, false);
  settings_window.setMenu(null)
}

async function get_custom_rewards(){
  return 
}