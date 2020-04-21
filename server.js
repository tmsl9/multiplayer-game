var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/',express.static(__dirname));

serv.listen(5500, '192.168.8.1');
var io = require('socket.io')(serv,{});
console.log("Server started.");
var start = Date.now()

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var total_players = 0;
var players_ready = 0;
const width = 640
const height = 640
var ZOMBIE_LIST = {};
var max_zombies = 5;
var living_zombies = 0;
var total_zombies = 0;
var max_zombies_level1 = 2;
let idZombie = 1;
const zombieTimerDelay = 5000;
var level = 0
var readyToText = false
var numReadyToText = 0
var readyToNextLevel = false
var numReadyToNextLevel = 0

var Player = function(id){
    console.log("Client entered the game with id: ", id)
    var self = {
        x:id % 2 != 0 ? 200 : 400,///////
        y:400,
        life:100,
        id:id, //important information
        number:total_players,
        pos:"downplayer" + id,
        typeBullets:0,
        ready:false,
        maxSpd:10
    }
    
    self.emitId = function(){
        var socket = SOCKET_LIST[self.id]
        socket.emit('id', self.id);
        console.log("-->", self.id)
    }

    return self;
}

var Zombie = function(x, y, id, type){
    //console.log("Zombie successfully created: ", id)
    var self = {
        x:x,
        y:y,
        life:100,
        id:id,
        dist:200,
        type:type,
        plCloser:0
    }

    return self;
}

io.sockets.on('connection', function(socket){
    console.log("total --> ",total_players)////os dois ficam com id 2
    if(total_players == 2){///está a dar problemas na sincronização
        total_players = 0;
        players_ready = 0;
        SOCKET_LIST = {}
        PLAYER_LIST = {}
    }
    console.log("New connection", total_players + 1)
    total_players++;
    socket.id = total_players;
    SOCKET_LIST[socket.id] = socket;
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    player.emitId();
    
    socket.on('Finish',function(){
        players_ready = 0
    })

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        total_players--
        players_ready--
    });

    socket.on('ready', function(){
        console.log("Player id", socket.id, "ready")
        PLAYER_LIST[socket.id].ready = true
        players_ready++
        if(players_ready == 2){
            for(var i in SOCKET_LIST){
                var socketEmit = SOCKET_LIST[i];
                socketEmit.emit('2players_ready');
            }
            console.log('Both players are ready!')
        }
    });
        
    socket.on('life',function(data){
        for(var i in PLAYER_LIST){
            var player2 = PLAYER_LIST[i];
            if(player2.id != player.id){
                player.life = data.life
                if(data.idZombie){
                    SOCKET_LIST[player2.id].emit('life', {life:player.life, idZombie:data.idZombie})
                }else if(data.idBullet){
                    SOCKET_LIST[player2.id].emit('life', {life:player.life, idBullet:data.idBullet})
                }else{
                    SOCKET_LIST[player2.id].emit('life', {life:player.life})
                }
            }
        }
    });

    socket.on('typeBullets',function(data){
        for(var i in PLAYER_LIST){
            var player2 = PLAYER_LIST[i];
            if(player2.id != player.id){
                player.typeBullets = data.typeBullets
                SOCKET_LIST[player2.id].emit('typeBullets', {typeBullets: player.typeBullets})
            }
        }
    });

    socket.on('lifeZombie',function(data){
        for(var i in ZOMBIE_LIST){
            var zombie = ZOMBIE_LIST[i];
            if(zombie.id == data.idZombie){
                zombie.life = data.life
                for(var j in PLAYER_LIST){
                    if(PLAYER_LIST[j].id != player.id){
                        var player2 = PLAYER_LIST[j]
                        SOCKET_LIST[player2.id].emit('lifeZombie', {idZombie:data.idZombie, idBullet:data.idBullet, life:data.life})
                    }
                }
                if(zombie.life <= 0){
                    living_zombies--;
                    //console.log(zombie.id,zombie.life,living_zombies);
                    delete ZOMBIE_LIST[zombie.id];
                }
            }
        }
    });

    socket.on('keyPress',function(data){
        var pack = [];
    
        for(var i in PLAYER_LIST){
            var player2 = PLAYER_LIST[i];
            if(player2.id != player.id){
                if(data.input === 'xy'){
                    player.x = data.x;
                    player.y = data.y;
                    player.pos = data.pos;
                    pack = {
                        x:player.x,
                        y:player.y,
                        pos:player.pos
                    }
                }else{
                    pack = {
                        mouseX:data.mouseX ? data.mouseX : 0,
                        mouseY:data.mouseY ? data.mouseY : 0,
                        idBullet:data.idBullet
                    }
                }
                SOCKET_LIST[player2.id].emit('playerAction', pack);
            }
        }
    });

    socket.on('zombiePosition',function(data){
        for(var i in ZOMBIE_LIST){
            var zombie = ZOMBIE_LIST[i];
            if(zombie.id == data.id){
                zombie.x = data.x
                zombie.y = data.y
                if(data.collider){
                    for(var i in PLAYER_LIST){
                        var player2 = PLAYER_LIST[i];
                        if(player2.id != player.id){
                            SOCKET_LIST[player2.id].emit('zombiePositionCollider', {id:zombie.id, x:zombie.x, y:zombie.y})
                        }
                    }
                }
            }
        }
    });

    socket.on('finishLevel',function(data){
        numReadyToText++
        if(numReadyToText == 2){
            numReadyToText = 0
            readyToText = true
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('readyToText')
            }
        }
    });

    socket.on('nextLevel',function(data){
        numReadyToNextLevel++
        if(numReadyToNextLevel == 2){
            level++
            numReadyToNextLevel = 0
            ZOMBIE_LIST = {}
            for(var i in PLAYER_LIST){
                PLAYER_LIST[i].x = 200 * PLAYER_LIST[i].id
                PLAYER_LIST[i].y = 200
                PLAYER_LIST[i].life = 100////fazer um cenario no caso de ambos perderem
            }
            readyToNextLevel = true
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('readyToNextLevel')
            }
        }
    });
});

setInterval(function(){//criação do inimigo
    console.log(level, total_zombies, max_zombies_level1, living_zombies, players_ready)
    if(level > 0 && level != 3 && total_zombies < max_zombies_level1 && players_ready == 2 && living_zombies < max_zombies_level1){
        let type;
        let x;
        let y;
        let randNum = Math.floor(Math.random() * 3);
        let xy1 = {x:12, y:13}//////////////////////dani
        let xy2 = {x:12, y:13}//////////////////////dani
        if(level == 1){
            if(randNum==0){
                x = 0;
                y = Math.floor(Math.random() * height);
            }else if( randNum == 1){
                x = width;
                y = Math.floor(Math.random() * height);
            }else if(randNum ==2){
                x = Math.floor(Math.random() * width);
                y = height;
            }
        }else{
            let xy = Math.floor(Math.random() * 2);
            if(xy == 0){
                x = xy1.x
                y = xy1.y
            }else{
                x = xy2.x
                y = xy2.y
            }
        }

        let prob = Math.floor(Math.random() * 100+1);
        
        if(prob <= 40){
            type = 1;
        }else if(prob <= 80){
            type = 2;
        }else{
            type = 3;
        }
        
        idZombie++;
        living_zombies++;
        total_zombies++;

        var zombie = Zombie(x, y, idZombie, type);
        ZOMBIE_LIST[idZombie] = zombie;
        
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('createZombie', {x:x, y:y, idZombie:idZombie, type:type, life:zombie.life});
        }
    }
}, zombieTimerDelay);

setInterval(function(){//mover o inimigo
    if(living_zombies > 0 && players_ready == 2){
        for(var ei in ZOMBIE_LIST){
            var zombie = ZOMBIE_LIST[ei]
            var plCloser
            var minor = 100000
            for(var pi in PLAYER_LIST){
                var player = PLAYER_LIST[pi]
                var dist = Math.sqrt(Math.pow(zombie.x - player.x, 2) + Math.pow(zombie.y - player.y, 2))
                if(minor > dist){
                    plCloser = player
                    minor = dist
                }
            }
            if((zombie.type == 1 && zombie.dist < minor) || (zombie.type != 1)){
                if(zombie.plCloser != plCloser.id){
                    zombie.plCloser = plCloser.id
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('moveZombie', {idPlayer:plCloser.id, idZombie:zombie.id});
                    }
                }
            }else{ // se for so tipo 1 e tiver a 200 não anda
                for(var i in SOCKET_LIST){/////nao esta a resultar em alguns casos
                    SOCKET_LIST[i].emit('moveZombie', {idZombie:zombie.id});
                }
            }
            
        }
    }
}, 200);

setInterval(function(){//range o inimigo
    if(total_zombies < max_zombies_level1 && players_ready == 2){
        for(var ei in ZOMBIE_LIST){
            var zombie = ZOMBIE_LIST[ei]
            if(zombie.type == 1){
                //console.log("shoot-> ", zombie.id, zombie.type, zombie.x, zombie.y)
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('zombieShoot', {id:zombie.id, time:Date.now() - start});
                }
            }
        }
    }
}, 500);