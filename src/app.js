var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var onlineUsers = [];

// Register events on socket connection
io.on('connection', function (socket) {

  // Listen to chantMessage event sent by client and emit a chatMessage to the client
  socket.on('chatMessage', function (message) {
    io.to(socket.id).emit('message', { message: message.message, created: new Date(), status: 'sender' });
    io.to(message.receiver).emit('message', { message: message.message, created: new Date(), status: 'receiver' });
  });

  // Listen to notifyTyping event sent by client and emit a notifyTyping to the client
  socket.on('notifyTyping', function (data) {
    io.to(data.id).emit('notifyTypingEmit', data.message);
  });

  // Listen to newUser event sent by client and emit a newUser to the client with new list of online users
  socket.on('newUser', function (user) {
    var newUser = { id: socket.id, name: user };
    onlineUsers.push(newUser);
    io.to(socket.id).emit('newUser', newUser);
    io.emit('onlineUsers', onlineUsers);
  });

  // Listen to disconnect event sent by client and emit userIsDisconnected and onlineUsers (with new list of online users) to the client 
  socket.on('disconnect', function () {
    onlineUsers.forEach(function (user, index) {
      if (user.id === socket.id) {
        onlineUsers.splice(index, 1);
        io.emit('userIsDisconnected', socket.id);
        io.emit('onlineUsers', onlineUsers);
      }
    });
  });

});

// Listen application request on port 3000
http.listen(5000, function () {
  console.log('listening on *:5000');
});