class TwitchConnectionInfo {
  constructor(app_id, user_key, user_id, username, session_id, subscription_type, reward_list, 
    key_obtained_time, hotkey_bind_dict, hotkey_duration_dict, default_bind, timestamp_type, first_time_user){
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
    this.timestamp_type = timestamp_type;
    this.first_time_user = first_time_user;
  }
}

var custom_rewards=[];
var bindings_window;

var event_expiry_time = -1;

const version_number = "23.03a";
const expiry_time = 1706659200;

//var hotkey_bind_dict = {};
//var hotkey_duration_dict = {};

var main_window;
var twitch_connection_info;// = new TwitchConnectionInfo(app_id="snbnlpo27abzy10fsg82bqqly26f80", user_key=null, user_id=null, username=null, session_id=null, subscription_type=null,
//reward_list=null, key_obtained_time=null, hotkey_bind_dict = hotkey_bind_dict, hotkey_duration_dict = hotkey_duration_dict);
var settings_window;
var event_queue = [];
var ws;
const {app, BrowserWindow, ipcMain, dialog, ipcRenderer} = require('electron');
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
const logger = require('electron-log');
var lock = new AsyncLock();
config_path = path.join(app.getAppPath(), 'User_Data');
storage.setDataPath(config_path);
app.icon = "images/logo1.ico";
const createWindow = (html_path, width = 800, height = 600, is_resizable = true, title="") => {
    const win = new BrowserWindow({
      width: width,
      height: height,
      'minHeight': height,
      'minWidth': width,
      'maxWidth': width,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
      title: title,
      resizable: is_resizable,
      icon: "images/logo1.ico",
    });
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
    ipcMain.on("open-settings-window", open_settings_window);
    ipcMain.on("close-window", close_window);
    ipcMain.on("save-misc-settings", save_misc_settings);
    ipcMain.on("open-misc-window", open_misc_window);
    ipcMain.on("close-setting-window", close_setting_window);
    ipcMain.on("open-about-window", open_about_window);
    ipcMain.on("refresh-rewards", refresh_rewards);
    const startup = can_use_app();
    if (!startup){
      dialog.showMessageBoxSync(options={title: 'Error', message: 'This version of Twitch Hotkey Assistant has expired, please visit https://okactuallyrob.itch.io/ to download the latest version.', type:'error'});
      app.exit();
    } else{
      main_window = createWindow("index.html", width = 600, height = 455, is_resizable=true, title="Twitch Hotkey Assistant");
      main_window.setMenu(null);
      
      main_window.on('close', function () {
        app.quit();
      })
      read_data_from_file();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          main_window = createWindow("index.html");
          
        }
      });
      if (twitch_connection_info.first_time_user === 1){
        dialog.showMessageBox(options={title: 'Welcome!', message: 'First time welcome message!'});
        twitch_connection_info.first_time_user = 0;
      }
    }
  });
  

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

function is_ready(){
  return !(twitch_connection_info.user_id === "" || twitch_connection_info.user_key === "" || 
  Object.keys(twitch_connection_info.hotkey_bind_dict).length === 0 || twitch_connection_info.reward_list.length === 0);
}

function start_listener(){
  if (!is_ready()){
    dialog.showMessageBox(options={title: 'Error', message: "Please authenticate this app with Twitch and set your keybinds in the settings panel!", type:'error'});
    main_window.webContents.send("set-feed-button", false);
  } else {
    main_window.webContents.send("toggle-settings", false);
    let feed_message = "Started listener";
    main_window.webContents.send("add-feed-label", feed_message, twitch_connection_info.timestamp_type);
    const event_task = new Task('event_queue_manager', read_event_queue);
    const event_job = new SimpleIntervalJob({ seconds: 1, }, event_task);
    scheduler.addSimpleIntervalJob(event_job);
    ws = new WebSocket('wss://eventsub.wss.twitch.tv/ws');
    ws.onopen = function(){
      
    }
    ws.on('message', function message(data){
      ws_parse_message(data);
    });
  }
}

function stop_listener(){
  let feed_message = "Stopped listener";
  main_window.webContents.send("add-feed-label", feed_message, twitch_connection_info.timestamp_type);
  main_window.webContents.send("toggle-settings", true);
  try {
    scheduler.stop();
    if (ws.readyState !== WebSocket.OPEN){
      ws.addEventListener('open', () => {
        ws.close();
      });
    } else {
      ws.close();
    }
  } catch (error) {
    
  }
  
}

function can_use_app(){
  const now = new Date()  
  const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);  
  const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
  if (utcSecondsSinceEpoch >= expiry_time){
    return false;
  }
  return true;
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
  let feed_message = "Pressed key: "+key_name;
  logger.info("Pressed key: "+key_name);
  main_window.webContents.send("add-feed-label", feed_message, twitch_connection_info.timestamp_type);
  robot.keyTap(key_name);
}

function read_event_queue(){
  lock.acquire(event_queue, function() {
    let seconds = (new Date().getTime())/1000;
    if (event_expiry_time == -1){
      if (event_queue.length > 0){
        let event_name = event_queue.shift();
        let feed_message = "Responding to event: "+event_name;
        logger.info("Responding to event: "+event_name);
        main_window.webContents.send("add-feed-label", feed_message, twitch_connection_info.timestamp_type);
        let key_names = twitch_connection_info.hotkey_bind_dict[event_name];
        logger.info("Found key(s) associated with event: "+key_names);
        key_names.forEach(key_name => {
          //let key_name = String(twitch_connection_info.hotkey_bind_dict[event_name]);
          key_name = key_name.toLowerCase();
          if (key_name !== "" && key_name !== "key_empty"){
            let duration = parseInt(twitch_connection_info.hotkey_duration_dict[event_name]);
            event_expiry_time = duration <= 0 ? -1 : seconds + duration;
            press_key(key_name);
          
          }
        });
      }
    } else if (seconds >= event_expiry_time && twitch_connection_info.default_bind !== "key_empty" && twitch_connection_info.default_bind !== ""){
      let key_name = String(twitch_connection_info.default_bind).toLowerCase();
      let feed_message = "Returning to default state";
      main_window.webContents.send("add-feed-label", feed_message, twitch_connection_info.timestamp_type);
      press_key(key_name);
      event_expiry_time = -1;
    }
  }).then();
  
}

function ws_parse_message(msg){
  msg = JSON.parse(msg);
  let message_type = msg.metadata.message_type;
  if (message_type === "session_welcome"){
    logger.info("Received session_welcome message from Helix API")
    twitch_connection_info.session_id = msg.payload.session.id;
    ws_subscribe_topic();
  } else if (message_type === "session_keepalive"){
    lock.acquire(event_queue, function() {
      logger.info("Current event queue status: " + String(event_queue));
    }).then(function(){});
  } else if (message_type === "notification") {
    if(msg.metadata.subscription_type === twitch_connection_info.subscription_type){
      logger.info("Received notification for subscribed event.");
      let redemption_status = msg.payload.event.status;
      if (redemption_status === "fulfilled"){
        let title = msg.payload.event.reward.title;
        if (title in twitch_connection_info.hotkey_bind_dict){
          let redeemer_name = msg.payload.event.user_name;
          logger.info("Event corresponds to configured hotkey in application. Appending to event queue.");
          let feed_message = String(redeemer_name) + " redeemed reward: "+String(title);
          main_window.webContents.send("add-feed-label", feed_message, twitch_connection_info.timestamp_type);
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
      logger.info("%s", body);
    }
  }
  request(options, callback);
}

function log_message(event, msg){
  logger.info(msg);
}

function save_wrapper(){
  logger.info("User data path: " + app.getPath('userData'));
  write_data_to_file(twitch_connection_info);
}

function write_data_to_file(connection_info){
  json_string = JSON.stringify(connection_info);
  logger.info("Saving the following data: " + json_string)
  storage.set('config.json', json_string);
}

function read_data_from_file(){
  logger.info("Reading user data from directory: " + storage.getDataPath());
  try {
    var json_obj = JSON.parse(storage.getSync('config.json'));
  } catch (error) {
    json_obj = {}
  }
  logger.info("Retrieved data: " + json_obj);
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
  new_default_bind = json_obj.default_bind === undefined ? "" : json_obj.default_bind;
  new_timestamp_type = json_obj.timestamp_type === undefined ? "time" : json_obj.timestamp_type;
  new_first_time_user = json_obj.first_time_user === undefined ? 1 : json_obj.first_time_user;
  twitch_connection_info = new TwitchConnectionInfo(new_app_id, new_user_key, new_user_id, 
                                                    new_username, new_session_id, new_subscription_type,
                                                    new_reward_list, new_key_obtained_time, new_hotkey_bind_dict,
                                                    new_hotkey_duration_dict, new_default_bind, new_timestamp_type,
                                                    new_first_time_user);
}

function close_window(){
  try {
    stop_listener();
  } catch (error) {
    
  }
  main_window.close();
}

function send_hotkey_dicts(event, bind_dict, duration_dict, default_bind){
  logger.info("Received hotkey configuration from settings window. New state of hotkey config:");
  logger.info(bind_dict);
  logger.info(duration_dict);
  twitch_connection_info.hotkey_bind_dict = bind_dict;
  twitch_connection_info.hotkey_duration_dict = duration_dict;
  twitch_connection_info.default_bind = default_bind;
  write_data_to_file(twitch_connection_info);
  //bindings_window.close();
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
      let expiry_time = response.data.expires_in; //rain#26915
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

async function save_auth_settings(event, user_key, callback_name){
  if (twitch_connection_info.user_key !== user_key){
    settings_window.webContents.send("show-save-lbl", true);
    twitch_connection_info.user_id = "";
    twitch_connection_info.user_key = user_key;
    let token_res = await check_user_token_expiry();
    if (token_res){
      settings_window.webContents.send("show-valid-key-img", true);
      token_res = await retrieve_user_id();
      await retrieve_channel_point_rewards();
      if (token_res){
          write_data_to_file(twitch_connection_info);
          settings_window.webContents.send("save-callback", callback_name);
      }
    } else{ 
      twitch_connection_info.user_key = "";
      twitch_connection_info.user_id = "";
      if (callback_name === "close"){
        settings_window.webContents.send("save-callback", callback_name);
      } else {
        settings_window.webContents.send("show-save-lbl", false);
      }
      
    }
  } else if (twitch_connection_info.user_key !== "" && twitch_connection_info.user_id !== ""){
    settings_window.webContents.send("show-valid-key-img", true);
    settings_window.webContents.send("save-callback", callback_name);
  } else {
    twitch_connection_info.user_key = "";
    twitch_connection_info.user_id = "";
    settings_window.webContents.send("save-callback", callback_name);
  }
}

async function refresh_rewards(event){
  await retrieve_channel_point_rewards();
  get_custom_rewards(settings_window);
  remove_panels(settings_window);
  settings_window.webContents.send("load-binding-panels","");
  //get_dicts(settings_window);
}

function remove_panels(b_window){
  b_window.webContents.send("remove-panels", "");
}

function save_misc_settings(event, timestamp_type){
  twitch_connection_info.timestamp_type = timestamp_type;
  write_data_to_file(twitch_connection_info);
}


function retrieve_user_id(){
  // let req = new XMLHttpRequest();
  let url = "https://id.twitch.tv/oauth2/validate"
  //twitch_connection_info.user_id = "";
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

async function bindings_window_handler(sender){
  if (twitch_connection_info.user_id === "" || twitch_connection_info.user_key === ""){
    logger.warn("Empty user_id, returning to previous page.");
    settings_window.loadFile(sender);
    //open_settings_window();
  } else {
    await settings_window.loadFile("bind_settings.html");
    let success = (twitch_connection_info.reward_list.length !== 0)//await retrieve_channel_point_rewards();
    if (success){
      logger.info("Opening bindings window with retrieved rewards: " + twitch_connection_info.reward_list);
      bindings_window = settings_window;//createWindow("bind_settings.html", 560, 400, false);
      //bindings_window.setMenu(null);
      get_custom_rewards(bindings_window);
      get_dicts(bindings_window); //twitch_connection_info.hotkey_bind_dict, twitch_connection_info.hotkey_duration_dict);
    } else {
      settings_window.loadFile(sender);
      //open_settings_window();
    }
  }
}

async function create_bindings_window(event, sender){
  let duration = 0;
  let fallback_page = "settings.html"
  if (sender === "settings"){
    //duration = 6000;
    fallback_page = "settings.html"
  } else if (sender === "misc") {
    duration = 0;
    fallback_page = "misc_settings.html";
  } else if (sender === "about") {
    duration = 0;
    fallback_page = "about.html"
  }
  setTimeout(function() {
    bindings_window_handler(fallback_page)
  }
  , duration);
}

function test_create_feed_label(){
  main_window.webContents.send("add-feed-label", "test text!", twitch_connection_info.timestamp_type);
}

async function retrieve_channel_point_rewards(){
  let custom_rewards = [];
  let url = "https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id="+twitch_connection_info.user_id+"&perPage=50"
  let config = {
    headers: {
      'Authorization': `Bearer ${twitch_connection_info.user_key}`,
      'Client-Id': twitch_connection_info.app_id
    }
  };
  return axios.get(url, config).then((response) => {
    response.data.data.forEach(element => {
      custom_rewards.push(element.title);
    });
    twitch_connection_info.reward_list = custom_rewards;
    return true;
    }).catch(() => {
      dialog.showMessageBox(options={title: 'Error', message: 'Could not retrieve channel point rewards. Have you entered your authentication key?', type:'error'});
      return false;
    });
}

function create_auth_window(){
  var redirect_url = "https://nnr-dev.github.io/THA-Authenticator/";
  var auth_url = "https://id.twitch.tv/oauth2/authorize?client_id=" + twitch_connection_info.app_id + "&redirect_uri="+encodeURIComponent(redirect_url) + "&response_type=token&scope=channel:read:redemptions";
  w = createWindow("index.html", title="Authentication Window");
  w.setMenu(null);
  w.loadURL(auth_url);
}

function open_settings_window(){
  if (twitch_connection_info.user_key !== ""){
    get_key(twitch_connection_info.user_key);
  }
  
}

function open_about_window(){  
  settings_window.webContents.removeAllListeners('did-finish-load');
  settings_window.webContents.on('did-finish-load', function() {
    settings_window.webContents.send("get-version-data", version_number);
  });
}

function open_misc_window(){
  settings_window.webContents.removeAllListeners('did-finish-load');
  settings_window.webContents.on('did-finish-load', function() {
    settings_window.webContents.send("get-misc-settings", twitch_connection_info.timestamp_type);
  });
  
}

function create_settings_window(){
  settings_window = createWindow("settings.html", 560, 420, true, "Settings");
  settings_window.on('close', event_close_handler);
  settings_window.setMenu(null)
  open_settings_window();
}

function event_close_handler(e){
  settings_window.webContents.send("save-current-window", "");
  e.preventDefault();
}

function close_setting_window(){
  settings_window.removeListener('close', event_close_handler);
  settings_window.close();
}

function get_key(key){
  settings_window.webContents.on('did-finish-load', function() {
    settings_window.webContents.send('get-auth-key', key);
  });
}

function get_dicts(b_window){
  //b_window.webContents.on('did-finish-load', function() {
    b_window.webContents.send('get-hotkey-dicts', twitch_connection_info.hotkey_bind_dict, twitch_connection_info.hotkey_duration_dict, twitch_connection_info.default_bind);
  //});
}


function get_custom_rewards(b_window){

  //b_window.webContents.on('did-finish-load', function() {
    b_window.webContents.send('custom-rewards', twitch_connection_info.reward_list);
  //});
}