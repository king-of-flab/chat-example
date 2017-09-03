var express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

users=[]
rooms = []

app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/home.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

app.get('/whiteboard', function(req, res){
  res.sendFile(__dirname + '/whiteboard.html');
});

var rooms = []
var roomNum = 1

io.on('connection', function(socket){
  // console.log(socket.id, "user connected")
  // socket.on('adduser', function (username) {
    users.push(socket.id)
    console.log(users)
    console.log("connected")

    if(rooms.length === 0 ) {
    rooms.push(socket.id)
    socket.room = "room" + roomNum
    socket.turn = true
    socket.join("room" + roomNum)
    console.log(socket.id + " joined " + socket.room , rooms.length, socket.turn, 1)
  } else if (rooms.length % 2 === 1) {
    rooms.push(socket.id)
    socket.turn = false
    socket.room = "room" + roomNum
    socket.join("room" + roomNum)
    console.log(socket.id + " joined " + socket.room , rooms.length, socket.turn, 2)
  } else if (rooms.length % 2 === 0) {
    socket.turn = true
    roomNum ++
    socket.room = "room" + roomNum
    rooms.push(socket.id)
    socket.join("room" + roomNum)
    console.log(socket.id + "joined " + socket.room, rooms.length, socket.turn, 3)
  }

  io.to(socket.id).emit('turn', socket.turn)

  socket.on('chat message', function(msg){
    io.emit('chat message',  msg);
  });

  io.emit('testconnection', users, socket.id)

socket.on('drawing', (data) => io.to(socket.room).emit('drawing', data))

  socket.on('disconnect', function () {
    userIndex = users.indexOf(socket.id)
    users.splice(userIndex, 1)
    console.log(users)

    io.emit('remove', socket.id)
  })
// })

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
