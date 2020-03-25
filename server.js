var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/',express.static(__dirname));

serv.listen(5500);
var io = require('socket.io')(serv,{});
console.log("Server started.");

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var total_players = 0;
var players_ready = 0;

var Player = function(id){
    console.log("Client entered the game with id: ", id)
    var self = {
        x:id % 2 != 0 ? 200 : 400,///////
        y:400,
        id:id, //important information
        number:total_players,
        ready:false,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        pressingSpace:false,
        maxSpd:10
    }
    
    self.emitId = function(){
        var socket = SOCKET_LIST[self.id]
        socket.emit('id', self.id);
        console.log("-->", self.id)
    }

    self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    }
    return self;
}

io.sockets.on('connection', function(socket){
    console.log("New connection", total_players + 1)
    total_players++;
    socket.id = total_players;
    SOCKET_LIST[socket.id] = socket;
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    player.emitId();
    
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        total_players--
        players_ready--
    });
    
    socket.on('ready',function(){
        console.log("Player id", socket.id, "ready")
        PLAYER_LIST[socket.id].ready = true
        players_ready++
    });
        
    socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
    });
});

setInterval(function(){
    if(players_ready == 2){
        for(var i in SOCKET_LIST){
            var socket = SOCKET_LIST[i];
            socket.emit('2players_ready');
        }
        console.log('Both players are ready!')
        players_ready = 3
    }
    if(players_ready == 3){//////
        var pack = [];
        
        for(var i in PLAYER_LIST){
            var player = PLAYER_LIST[i];
            player.updatePosition();
            pack.push({
                x:player.x,
                y:player.y,
                id:player.id
            });
        }
        for(var i in SOCKET_LIST){
            var socket = SOCKET_LIST[i];
            //console.log("pack n",i,"->",pack);
            socket.emit('newPositions',pack);
        }
    }
}, 20);//total_players > 0 && total_players % 2 == 0 ? 1000/25 : 0);