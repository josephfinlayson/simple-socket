'use strict';
/*************************************
//
// simple-socket app
//
**************************************/
//util function
$(function() {
    var addData = function(elem, data) {
        if (data !== null) {
            var para = document.createElement('p');
            para.innerHTML = data
            elem.append(para)
        }
    }


    //two sockets to the same connection doesn;t work problels
    var socketMethod1S1 = io.connect('http://127.0.0.1:1337', {
        query: "discussionRoomId=stream1"
    })

    var socketMethod1S2 = io.connect('http://127.0.0.1:1337/', {
        query: "discussionRoomId=stream2"
    })


    // //this is one way of doing it, using subscribe calls without joining rooms
    var socketMethod2 = io.connect('http://127.0.0.1:1337/discussionRooms');

    // //the way I would do it - you only need one socket (performance improvements),
    // // and it's really flexible, and you get to use the rooms feature
    var socketMethod3 = io.connect('http://127.0.0.1:1337/roomDiscussion');

    // Method 1 -- not functioning, cannot open 2 connections to the same socket
    socketMethod1S1.on('connect', function(data) {
        socketMethod1S1.on('stream1', function(data) {
            console.log(data)
            var elem = $('#allPostsM1S1');
            addData(elem, data);
        })
    })

    socketMethod1S2.on('connect', function(data) {
        socketMethod1S2.on('stream2', function(data) {
            console.log(data);
            var elem = $('#allPostsM12S2');
            addData(elem, data);
        })
    })

    //Method 2 - > subscribing without rooms
    socketMethod2.on('connect', function() {
        socketMethod2.emit('subscribe', {
            stream: "stream1" //this could be an array of subscriptions with more fiddling
        })
        socketMethod2.emit('subscribe', {
            stream: "stream2"
        })
    })

    socketMethod2.on('stream1', function(data) {
        // console.log(data)
        var elem = $('#allPostsM2S1')
        addData(elem, data);

    })

    socketMethod2.on('stream2', function(data) {
        // console.log(data)
        var elem = $('#allPostsM2S2')
        addData(elem, data);

    })

    //  Method 3 - combining rooms and a single subscription

    socketMethod3.on('connect', function() {
        socketMethod3.emit('joinRoom', {
            room: "stream1" //this could be an array of subscriptions with more fiddling
        })
        socketMethod3.emit('joinRoom', {
            room: "stream2"
        })
    })

    socketMethod3.on('stream1', function(data) {
        // console.log("s1", data)
        var elem = $('#allPostsM3S1')
        addData(elem, data);
    })

    socketMethod3.on('stream2', function(data) {
        // console.log("s2", data)
        var elem = $('#allPostsM3S2')
        addData(elem, data);

    })

});
