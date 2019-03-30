'use strict';

const HTTP_PORT = 8080;
const WS_PORT = 8081;

// HTTP
// used only to get initial value

// note that editor id is dynamic in route,
// collab takes place if >1 users
// are using the same editor id
const express = require('express');
const app = express();

// set headers
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Content-Type', 'application/json');
  next();
});

// route(s)
app.get('/:editorId', (req, res) => {
  const editorId = req.params.editorId;
  // console.log(editorId);

  if (editorId) {
    const json = require('./value.json');
    res.json({
      editorId: editorId,
      value: json
    });
  }
});

app.listen(
  HTTP_PORT,
  () => console.log(`HTTP server listening on port ${HTTP_PORT}!`)
);



// WEBSOCKETS
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: WS_PORT});
console.log(`WS server listening on port ${WS_PORT}!`);

// dictionary of editor ids with a list
// of subscribed users/connections
let editors = {};

wss.on('connection', function connection(ws, req) {
  // new connection

  // could use any strategy here for ids,
  // Im using signature "<domain>/editor-id/user-id"
  // 1. there's no validation here at all !!
  // 2. new WS connection for each editor, prototype :)

  // remove first "/"
  const url = req.url.substring(1);
  // split into ids
  const [editorId, userId] = url.split('/');

  // subscribe to editor topic
  if (!editors[editorId]) {
    editors[editorId] = [];
  }
  editors[editorId].push({
    userId: userId,
    connTime: (new Date).getTime(),
    socket: ws
  });


  // send "user X connected" message
  sendMsgToSubs('CONNECT', {editorId, userId});


  // WS events
  ws.on('message', function onIncomingMessage(data) {
    // recieved message from user
    // broadcast to other users who use the same editor
    const obj = JSON.parse(data);

    if (obj.editorId && obj.operations && obj.operations.length > 0) {
      sendMsgToSubs('OPERATIONS', {
        editorId,
        userId,
        operations: obj.operations
      });
    }

    // TODO: mutate the back-end version of "value"
    // so that new connections get the latest version
  });


  ws.on('close', function onConnectionClose(code, reason) {
    // connection is closed
    const userIndexInTopic = editors[editorId].indexOf(userId);
    if (userIndexInTopic) {
      // remove user from topic
      editors[editorId].splice(userIndexInTopic);
      // delete topic if no users
      if (editors[editorId].length < 1) {
        delete editors[editorId];
      } else {
        // send "user X disconnected" message
        sendMsgToSubs('DISCONNECT', {editorId, userId});
      }
    }
  });



  // helpers
  function sendMsgToSubs(type, data) {
    if (!type || !data) return;

    let message;
    switch(type) {
      case 'CONNECT': message = {
        event: type,
        userId: data.userId,
        time: (new Date).getTime()
      };
      break;
      case 'DISCONNECT': message = {
        event: type,
        userId: data.userId,
        time: (new Date).getTime()
      };
      break;
      case 'OPERATIONS': message = {
        event: type,
        userId: data.userId,
        editorId: data.editorId,
        operations: data.operations,
        time: (new Date).getTime()
      };
    }

    message = JSON.stringify(message);
    editors[data.editorId].forEach(sub => {
      // exclude ourselves
      if (sub.socket !== ws && sub.socket.readyState === WebSocket.OPEN) {
        sub.socket.send(message);
      }
    });
  }
});
