// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var port = null;

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

function appendMessage(text) {
  document.body.innerHTML += "<p>" + text + "</p>";
}

function updateUiState() {
  if (port) {
    document.getElementById('connect-button').style.display = 'none';
    document.getElementById('input-text').style.display = 'block';
    document.getElementById('send-message-button').style.display = 'block';
  } else {
    document.getElementById('connect-button').style.display = 'block';
    document.getElementById('input-text').style.display = 'none';
    document.getElementById('send-message-button').style.display = 'none';
  }
}

function sendNativeMessage() {
  message = {"text": document.getElementById('input-text').value};
  port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
  updateUiState();
}

function connect() {
  var hostName = "com.google.chrome.example.echo";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  appendMessage(port);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
  updateUiState();
}

var connect_btn = document.createElement("button");
connect_btn.text = "Connect";
connect_btn.id = "connect-button";

var inp = document.createElement("input");
inp.type = "text";
inp.id = "input-text";

var send_btn = document.createElement("button");
send_btn.id = "send-message-button";
send_btn.text = "Send";

document.body.appendChild(connect_btn);
document.body.appendChild(inp);
document.body.appendChild(send_btn);

document.getElementById('connect-button').addEventListener(
'click', connect);
document.getElementById('send-message-button').addEventListener(
'click', sendNativeMessage);
  updateUiState();
connect();

chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
});

/*
document.addEventListener('DOMContentLoaded', function () {
  var connect_btn = document.createElement("button");
  connect_btn.text = "Connect";
  connect_btn.id = "connect-button";

  var inp = document.createElement("input");
  inp.type = "text";
  inp.id = "input-text";

  var send_btn = document.createElement("button");
  send_btn.id = "send-message-button";
  send_btn.text = "Send";

  document.body.appendChild(connect_btn);
  document.body.appendChild(inp);
  document.body.appendChild(send_btn);
 
  document.getElementById('connect-button').addEventListener(
      'click', connect);
  document.getElementById('send-message-button').addEventListener(
      'click', sendNativeMessage);
  updateUiState();
});
*/
var funcToInject = function() {
    var selection = window.getSelection();
    return (selection.rangeCount > 0) ? selection.toString() : '';
};

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

/* This line converts the above function to string
 * (and makes sure it will be called instantly) */
var jsCodeStr = ';(' + funcToInject + ')();';
chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
});

chrome.commands.onCommand.addListener(function(cmd) {
    if (cmd === 'toggle-feature') {
        console.log("lol");
        /* Inject the code into all frames of the active tab */
        chrome.tabs.executeScript({
            code: jsCodeStr,
            allFrames: true   //  <-- inject into all frames, as the selection
                              //      might be in an iframe, not the main page
        }, function(selectedTextPerFrame) {
            if (chrome.runtime.lastError) {
                /* Report any error */
                alert('ERROR:\n' + chrome.runtime.lastError.message);
            } else if ((selectedTextPerFrame.length > 0)
                    && (typeof(selectedTextPerFrame[0]) === 'string')) {
                /* The results are as expected */
                console.log(selectedTextPerFrame[0]);
                copyTextToClipboard(selectedTextPerFrame[0]);
                alert('Selected text: ' + selectedTextPerFrame[0]);
		message = {"text": selectedTextPerFrame[0]};
		console.log(port.postMessage(message));
  		appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
		 
            }
        });
    }
});
