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

var custom_rewards=[];
var bindings_window;
var hotkey_bind_dict = {};
var hotkey_duration_dict = {};

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
var main_window;
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
    //ipcMain.handle('get-custom-rewards', get_custom_rewards)
    ipcMain.on('log-message', log_message);
    ipcMain.on("create-settings-window", create_settings_window);
    ipcMain.on("create-auth-window", create_auth_window);
    ipcMain.on("save-auth-settings", save_auth_settings);
    ipcMain.on("create-bindings-window", create_bindings_window);
    ipcMain.on("send-hotkey-dicts", send_hotkey_dicts);
    createWindow("index.html");
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        main_window = createWindow("index.html");
      }
    });
  });
  

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
function log_message(event, msg){
  console.log(msg);
}

function send_hotkey_dicts(event, bind_dict, duration_dict){
  console.log("Doing binding!");
  console.log(bind_dict);
  console.log(duration_dict);
  hotkey_bind_dict = bind_dict;
  hotkey_duration_dict = duration_dict;
  
}

function check_user_token_expiry(){
  let url = "https://id.twitch.tv/oauth2/validate"
  let config = {
    headers: {
      'Authorization': `Bearer ${twitch_connection_info.user_key}`
    }
  }
  return axios.get(url, config).then((response) => {
    
    if (response.status == 200){
      //console.log(response);
      let expiry_time = response.data.expires_in; //rain#26915
      //console.log(expiry_time);
      if (expiry_time < 2*86400){
        dialog.showMessageBox(options={title: 'Key Expires Soon', message:'User key will expire soon. Consider generating a new user key.', type:'warning'})
      }
      return true
    } else{
      dialog.showMessageBox(options={title: 'Error', message: 'User key invalid! Are you sure you entered your user key correctly?', type:'error'});
      return false;
    }
  }).catch(() => {
    dialog.showMessageBox(options={title: 'Error', message: 'User key invalid! Are you sure you entered your user key correctly?', type:'error'});
    return false;
  });
}

async function save_auth_settings(event, user_key){
  twitch_connection_info.user_key = user_key;
  let token_res = await check_user_token_expiry();
  if (token_res){
    token_res = await retrieve_user_id();
    if (token_res){
        settings_window.close();
    }
  }
  
  // console.log(status);
  // let success = await status;
  // console.log(success);
  // if (success){
    
  // }
}


function retrieve_user_id(){
  // let req = new XMLHttpRequest();
  let url = "https://id.twitch.tv/oauth2/validate"
  let config = {
    headers: {
      'Authorization': `Bearer ${twitch_connection_info.user_key}`
    }
  }
  return axios.get(url, config).then((response) => {
    if (response.status == 200){
      twitch_connection_info.user_id = response.data.user_id; //rain#26915
      return true;
    } else{
      dialog.showMessageBox(options={title: 'Error', message: 'User key invalid! Are you sure you entered your user key correctly?', type:'error'});
      return false;
    }
  }).catch(() => {
    dialog.showMessageBox(options={title: 'Error', message: 'User key invalid! Are you sure you entered your user key correctly?', type:'error'});
    return false;
  });
}

async function create_bindings_window(){
  let success = await retrieve_channel_point_rewards();
  if (success){
    bindings_window = createWindow("bind_settings.html", 400, 600, false);
    bindings_window.setMenu(null);
    get_custom_rewards()
  }
  
}

async function retrieve_channel_point_rewards(){
  custom_rewards = [];
  let url = "https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id="+twitch_connection_info.user_id+"&perPage=50"
  //console.log(`Bearer ${twitch_connection_info.user_key}`);
  let config = {
    headers: {
      'Authorization': `Bearer ${twitch_connection_info.user_key}`,
      'Client-Id': twitch_connection_info.app_id
    }
  };
  //console.log(url);
  return axios.get(url, config).then((response) => {
    //console.log(response.data.data);
    response.data.data.forEach(element => {
      custom_rewards.push(element.title);
      //console.log(element.title);
    });
    return true;
      // console.log(response.data);
      // twitch_connection_info.user_id=response.data.data[0].id;
      // console.log(twitch_connection_info.user_id);
    }).catch(() => {
      dialog.showMessageBox(options={title: 'Error', message: 'Could not retrieve channel point rewards. Have you entered your authentication key?', type:'error'});
      return false;
    });
}

function create_auth_window(){
  var redirect_url = "https://okactuallyrob.github.io/Twitch-Authenticator/";
  var auth_url = "https://id.twitch.tv/oauth2/authorize?client_id=" + twitch_connection_info.app_id + "&redirect_uri="+encodeURIComponent(redirect_url) + "&response_type=token&scope=channel:read:redemptions";
  w = createWindow("index.html");
  w.loadURL(auth_url);
}

function create_settings_window(){
  settings_window = createWindow("settings.html", 400, 172, false);
  settings_window.setMenu(null)
}

function get_custom_rewards(){
  //console.log(custom_rewards);
  //console.log(bindings_window);
  bindings_window.webContents.on('did-finish-load', function() {
    bindings_window.webContents.send('custom-rewards', custom_rewards);
  });
  //console.log("sent");
}