"use strict";
/*************************************
//
// simple-socket app
//
**************************************/

// express magic

var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device = require('express-device');

var url = require('url');

var runningPortNumber = process.env.PORT;
app.engine('html', require('ejs').renderFile);

app.get("/", function(req, res) {
    res.render('index', {});
});

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    //set the view engine
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    app.use(device.capture());
});


//util function to emit the correct message
var sendStream = function(socket, ioevent, room) {
    // console.log(streamObj[stream + 'Array']);
    setInterval(function() {
        var message = streamObj[ioevent + 'Array'].shift();
        if (room) {
            socket.to(room).emit(ioevent, message);
        } else {
            socket.emit(ioevent, message)
        }
    }, 1000)

}

var streamObj = {}
streamObj.stream1Array = [];
streamObj.stream2Array = [];

//These functions you don't need to worry about, they're just generating
//an array of random strings
var stream1 = function() {
    setInterval(function() {
        var num = Math.random();
        streamObj.stream1Array.push("stream1 " + num)
    }, 100)
}


var stream2 = function() {
    setInterval(function() {
        var num = Math.random();
        streamObj.stream2Array.push("stream2 " + num)
    }, 100)
}

stream1();
stream2();

// Method 1
io.set('authorization', function(handshakeData, cb) {
    // console.log('Auth: ', handshakeData.query); this doesn't work with s.io 1.0+!
    cb(null, true);
});

io.sockets.on('connection', function(socket) {
    console.log(socket.handshake.query.foo)
    if (socket.handshake.query.discussionRoomId) {
        sendStream(socket,socket.handshake.query.discussionRoomId);
    }

    //if you're not namespacing you can use the subscribe or joinRoom call here
    // socket.on('subscribe', function(data) {
    //     sendStream(socket, data.stream);
    // });

});

// Method 2
var discussionRoom = io.of('/discussionRooms');
discussionRoom.on('connection', function(socket) {
    socket.on('subscribe', function(data) {
        // console.log(data)
        sendStream(socket, data.stream);
    });
});

// Method 3
var roomDiscussion = io.of('/roomDiscussion');
roomDiscussion.on('connection', function(socket) {
    socket.on('joinRoom', function(data) { // this is similar to the subscribe event above
        // console.log(data.room);
        socket.join(data.room);
        if (data.room) {
            socket.join(data.room); // you would then bind your mongo store to this room

            //the second parameter is actually the event you want to emit to,
            //for simplicity the room and event are the same
            sendStream(socket, data.room, data.room)
        }
    })

});

server.listen(runningPortNumber);
