'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chatLog = {};
var users = {};
var room = {};
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  //console.log(chatLog);

  //io.sockets.connected[socket.id].emit('chat message', chatLog);

  socket.on('user name', function(name){
    users[socket.id] = name; //bind username to id
  });
  socket.on('chatroom', function(chatroom){
    socket.join(chatroom);
    if(chatLog[chatroom]){
      socket.emit('chat message', chatLog[chatroom]);
    }
    room[socket.id] = chatroom;

  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    //console.log(arguments);
    var chatroom = room[socket.id];
    console.log('message: ' + msg);
    msg = formatTime(new Date()) + ' ' + users[socket.id] + ':  ' + msg;
    if(!chatLog[chatroom]) {
      chatLog[chatroom] = [];
    }
    chatLog[chatroom].push(msg);
    io.to(room[socket.id]).emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *: 3000');
});

function formatTime(date){
  return ((date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':' +
    (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()))
      .replace(/ /g, '');
}