class TwitchConnectionInfo {
  constructor(app_id, user_key, user_id, username, session_id, subscription_type, reward_list, key_obtained_time, hotkey_bind_dict, hotkey_duration_dict, default_bind){
    this.app_id = app_id;
    this.user_key = user_key;
    this.user_id = user_id;
    this.username = username;
    this.session_id = session_id;
    this.subscription_type = subscription_type;
    this.reward_list = reward_list;
    this.key_obtained_time = key_obtained_time;
    this.hotkey_bind_dict = hotkey_bind_dict;
    this.hotkey_duration_dict = hotkey_duration_dict;
    this.default_bind = default_bind;
  }
}

var custom_rewards=[];
var bindings_window;

var event_expiry_time = -1;

//var hotkey_bind_dict = {};
//var hotkey_duration_dict = {};

var windows = new Set();
var main_window;
var twitch_connection_info;// = new TwitchConnectionInfo(app_id="snbnlpo27abzy10fsg82bqqly26f80", user_key=null, user_id=null, username=null, session_id=null, subscription_type=null,
//reward_list=null, key_obtained_time=null, hotkey_bind_dict = hotkey_bind_dict, hotkey_duration_dict = hotkey_duration_dict);
var settings_window;
var event_queue = [];
var ws;
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const storage = require('electron-json-storage')
const path = require('path');
const robot = require('robotjs');
//////var proc = robot.startJar();
const axios = require('axios');
const { create } = require('domain');
const { write, read } = require('fs');
const WebSocket = require('ws');
const request = require('request');
const AsyncLock = require('async-lock');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const scheduler = new ToadScheduler()
var lock = new AsyncLock();
config_path = path.join(app.getAppPath(), 'User_Data');
storage.setDataPath(config_path);

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
    ipcMain.on("save-wrapper", save_wrapper);
    ipcMain.on("test-create-feed-label", test_create_feed_label);
    ipcMain.on("start-listener", start_listener);
    ipcMain.on("stop-listener", stop_listener);
    main_window = createWindow("index.html");
    read_data_from_file();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        main_window = createWindow("index.html");
        
      }
    });
  });
  

  app.on('window-all-closed', () => {
    try {
      // robot.stopJar();
      // proc.kill();
    } catch (error) {
      
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

function start_listener(){
  x="yo"
  event_queue.push('drimk');
  //press_key("e");
  const event_task = new Task('event_queue_manager', read_event_queue);
  const event_job = new SimpleIntervalJob({ seconds: 1, }, event_task);
  scheduler.addSimpleIntervalJob(event_job);
  // lock.acquire(event_queue, function() {
  //   event_queue.push(x);
  // }).then(console.log(event_queue));
  ws = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws');
  ws.onopen = function(){
    
  }
  ws.on('message', function message(data){
    ws_parse_message(data);
  });
}

function stop_listener(){
  scheduler.stop();
  ws.close();
}

function array_remove_by_val(array, item){
  var index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
}

function press_key(key_name){
  //robot.startJar();
  // robot.press(key_name)
  // .sleep(100)
  // .release(key_name)
  // .go().then();//robot.stopJar);
  robot.keyTap(key_name);
}

function read_event_queue(){
  lock.acquire(event_queue, function() {
    let seconds = (new Date().getTime())/1000;
    if (event_expiry_time == -1){
      if (event_queue.length > 0){
        let event_name = event_queue.shift();
        let key_name = String(twitch_connection_info.hotkey_bind_dict[event_name]);
        key_name = key_name.toLowerCase();
        let duration = parseInt(twitch_connection_info.hotkey_duration_dict[event_name]);
        event_expiry_time = duration <= 0 ? -1 : seconds + duration;
        //console.log("PRESSING FOR EVENT " + key_name);
        press_key(key_name);
      }
    } else if (seconds >= event_expiry_time){
      console.log("RETURNING TO DEFAULT");
      let key_name = String(twitch_connection_info.default_bind).toLowerCase();
      press_key(key_name);
      event_expiry_time = -1;
    }
  }).then();
  
}

function ws_parse_message(msg){
  msg = JSON.parse(msg);
  let message_type = msg.metadata.message_type;
  if (message_type === "session_welcome"){
    twitch_connection_info.session_id = msg.payload.session.id;
    ws_subscribe_topic();
  } else if (message_type === "session_keepalive"){
    console.log("Keepalive message");
    lock.acquire(event_queue, function() {
      console.log(event_queue);
    }).then(function(){});
  } else if (message_type === "notification") {
    console.log("Notification");
    if(msg.metadata.subscription_type === twitch_connection_info.subscription_type){
      console.log("Subscription");
      let redemption_status = msg.payload.event.status;
      if (redemption_status === "fulfilled"){
        console.log("Fulfilled");
        let title = msg.payload.event.reward.title;
        if (title in twitch_connection_info.hotkey_bind_dict){
          console.log("Appending");
          lock.acquire(event_queue, function() {
            event_queue.push(title);
          }).then(function(){});
        }
      }
    }
  }
  
}

function ws_subscribe_topic(){
  var request = require('request');
  var data = {"type":"channel.channel_points_custom_reward_redemption.add",
              "version":"1",
              "condition":{"broadcaster_user_id":twitch_connection_info.user_id, "moderator_user_id":twitch_connection_info.user_id},
              "transport":{"method": "websocket","session_id":twitch_connection_info.session_id}
          };
  var options = {
    method: 'POST',
    body: data,
    json: true,
    url: "https://api.twitch.tv/helix/eventsub/subscriptions",
    headers: {'Authorization': 'Bearer '+twitch_connection_info.user_key,
              'Client-Id': twitch_connection_info.app_id,
              'Content-Type': "application/json"
    }
  };
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("%s", body);
    }
  }
  request(options, callback);
}

function log_message(event, msg){
  console.log(msg);
}

function save_wrapper(){
  console.log(app.getPath('userData'));
  write_data_to_file(twitch_connection_info);
}

function write_data_to_file(connection_info){
  json_string = JSON.stringify(connection_info);
  console.log(json_string)
  storage.set('config.json', json_string);
}

function read_data_from_file(){
  console.log(storage.getDataPath());
  var json_obj = JSON.parse(storage.getSync('config.json'));
  console.log(json_obj);
  console.log(json_obj["user_key"]);
  new_app_id = json_obj.app_id === undefined ? "snbnlpo27abzy10fsg82bqqly26f80" : json_obj.app_id;
  new_user_key = json_obj.user_key === undefined ? "" : json_obj.user_key;
  new_user_id = json_obj.user_id === undefined ? "" : json_obj.user_id;
  new_username = json_obj.username === undefined ? "" : json_obj.username;
  new_session_id = json_obj.session_id === undefined ? "" : json_obj.session_id;
  new_subscription_type = json_obj.subscription_type === undefined ? "channel.channel_points_custom_reward_redemption.add" : json_obj.subscription_type;
  new_reward_list = json_obj.reward_list === undefined ? [] : json_obj.reward_list;
  new_key_obtained_time = json_obj.key_obtained_time === undefined ? "" : json_obj.key_obtained_time;
  new_hotkey_bind_dict = json_obj.hotkey_bind_dict === undefined ? {} : json_obj.hotkey_bind_dict;
  new_hotkey_duration_dict = json_obj.hotkey_duration_dict === undefined ? {} : json_obj.hotkey_duration_dict;
  new_default_bind = json_obj.default_bind == undefined ? "" : json_obj.default_bind;
  twitch_connection_info = new TwitchConnectionInfo(new_app_id, new_user_key, new_user_id, 
                                                    new_username, new_session_id, new_subscription_type,
                                                    new_reward_list, new_key_obtained_time, new_hotkey_bind_dict,
                                                    new_hotkey_duration_dict, new_default_bind);
  //console.log(json_obj);
}

function send_hotkey_dicts(event, bind_dict, duration_dict, default_bind){
  console.log("Doing binding!");
  console.log(bind_dict);
  console.log(duration_dict);
  twitch_connection_info.hotkey_bind_dict = bind_dict;
  twitch_connection_info.hotkey_duration_dict = duration_dict;
  twitch_connection_info.default_bind = default_bind;
  bindings_window.close();
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
    get_custom_rewards();
    get_dicts(twitch_connection_info.hotkey_bind_dict, twitch_connection_info.hotkey_duration_dict);
    
  }
  
}

function test_create_feed_label(){
  main_window.webContents.send("add-feed-label", "test text!");
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
  if (twitch_connection_info.user_key !== ""){
    get_key(twitch_connection_info.user_key);
  }
}

function get_key(key){
  settings_window.webContents.on('did-finish-load', function() {
    settings_window.webContents.send('get-auth-key', key);
  });
}

function get_dicts(){
  console.log("sending data back over!");
  bindings_window.webContents.on('did-finish-load', function() {
    bindings_window.webContents.send('get-hotkey-dicts', twitch_connection_info.hotkey_bind_dict, twitch_connection_info.hotkey_duration_dict, twitch_connection_info.default_bind);
  });
}


function get_custom_rewards(){
  //console.log(custom_rewards);
  //console.log(bindings_window);
  bindings_window.webContents.on('did-finish-load', function() {
    bindings_window.webContents.send('custom-rewards', custom_rewards);
  });
  //console.log("sent");
}