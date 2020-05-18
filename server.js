var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    
    // device detection
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    }else{
        
    }res.sendFile(__dirname + '/index.html');
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
var max_zombies_each = 10;//max de zombies presentes ao mesmo tempo no campo
var living_zombies = 0;
var total_zombies = 0;
var max_zombies_level1 = 40;//max em todo o nivel
var idZombie = 0;
const zombieTimerDelay = 5000;
var level = 0
var readyToText = false
var numReadyToText = 0
var readyToNextLevel = false
var numReadyToNextLevel = 0
var playerDead = false
var finish = 0

var Player = function(id){
    console.log("Client entered the game with id: ", id)
    var self = {
        x:id % 2 != 0 ? 200 : 440,
        y:400,
        life:100,
        id:id,
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
    var self = {
        x:x,
        y:y,
        life:100,
        id:id,
        dist:200,
        type:type
    }

    return self;
}

var Mage = function(){
    var self = {
        x:320,
        y:200,
        life:200
    }

    return self;
}

var mage = Mage()

io.sockets.on('connection', function(socket){
    console.log("New connection", total_players + 1)/////make if 2 players are already playing
    total_players++;
    socket.id = total_players;
    SOCKET_LIST[socket.id] = socket;
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    player.emitId();
    
    socket.on('Finish',function(){
        finish++
        if(finish == 1){
            players_ready = 0;
            mage = Mage();
            living_zombies = 0;
            total_zombies = 0;
            level = 0;
            ZOMBIE_LIST = {};
            idZombie = 0;
            readyToText = false
            numReadyToText = 0
            readyToNextLevel = false
            numReadyToNextLevel = 0
            playerDead = false
        }else{
            finish = 0
        }
        player = Player(socket.id)
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

    socket.on('life',function(data){
        for(var i in PLAYER_LIST){
            var player2 = PLAYER_LIST[i];
            if(player2.id != player.id){
                player.life = data.life
                if(player.life <= 0){
                    playerDead = true
                }
                if(data.idZombie){
                    SOCKET_LIST[player2.id].emit('life', {life:player.life, idZombie:data.idZombie})
                }else if(data.idBullet){
                    SOCKET_LIST[player2.id].emit('life', {life:player.life, idBullet:data.idBullet})
                }else if(data.mage){
                    SOCKET_LIST[player2.id].emit('life', {mage:true, life:player.life})
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
                    delete ZOMBIE_LIST[zombie.id];
                }
            }
        }
    });

    socket.on('zombiePosition',function(data){
        for(var i in ZOMBIE_LIST){
            var zombie = ZOMBIE_LIST[i];
            if(zombie.id == data.id){
                zombie.x = data.x
                zombie.y = data.y
            }
        }
    });

    socket.on('lifeMage',function(data){
        mage.life = data.life
        for(var j in PLAYER_LIST){
            if(PLAYER_LIST[j].id != player.id){
                var player2 = PLAYER_LIST[j]
                SOCKET_LIST[player2.id].emit('lifeMage', {idBullet:data.idBullet, life:data.life})
            }
        }
    });

    socket.on('magePosition',function(data){
        mage.x = data.x
        mage.y = data.y
    });

    socket.on('finishLevel',function(){
        numReadyToText++
        readyToNextLevel = false
        if(numReadyToText == 2){
            numReadyToText = 0
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('readyToText')
            }
        }
    });

    socket.on('nextLevel',function(){
        numReadyToNextLevel++
        if(numReadyToNextLevel == 2){
            level++
            numReadyToNextLevel = 0
            ZOMBIE_LIST = {}
            living_zombies = 0
            total_zombies = 0
            for(var i in PLAYER_LIST){
                PLAYER_LIST[i].x = 200 * PLAYER_LIST[i].id
                PLAYER_LIST[i].y = 400
                PLAYER_LIST[i].life = 100
            }
            readyToNextLevel = true
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('readyToNextLevel')
            }
        }
    });
});

setInterval(function(){//criação do inimigo
    if(readyToNextLevel && (restrictionsLevel1() || restrictionsLevel2()) && living_zombies < max_zombies_each && !playerDead){
        let type;
        let x;
        let y;
        let randNum = Math.floor(Math.random() * 3);
        
        if(level == 1){
            if(randNum == 0){
                x = 0;
                y = Math.floor(Math.random() * height);
            }else if(randNum == 1){
                x = width;
                y = Math.floor(Math.random() * height);
            }else if(randNum ==2){
                x = Math.floor(Math.random() * width);
                y = height;
            }
        }else{
            Math.floor(Math.random() * 2) == 0 ? x = 304 : x = 336
            y = 113
        }
        
        let prob = Math.floor(Math.random() * 100 + 1);
        
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
            SOCKET_LIST[i].emit('createZombie', {x:x, y:y, idZombie:idZombie, type:type});
        }
    }
}, zombieTimerDelay);

setInterval(function(){
    if(readyToNextLevel && level != 3 && living_zombies > 0 && !playerDead){//zombie move
        moveZombie()
    }
    if(readyToNextLevel && level == 2 && mage.life > 0 && !playerDead){//mage move
        moveMage()
    }
}, 200);

function moveZombie(){//zombie move
    for(var ei in ZOMBIE_LIST){
        var zombie = ZOMBIE_LIST[ei]
        var plCloser
        var minor = 1000
        for(var pi in PLAYER_LIST){
            var player = PLAYER_LIST[pi]
            var dist = Math.sqrt(Math.pow(zombie.x - player.x, 2) + Math.pow(zombie.y - player.y, 2))
            if(minor > dist){
                plCloser = player
                minor = dist
            }
        }
        if((zombie.type == 1 && zombie.dist < minor) || zombie.type != 1){
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('moveZombie', {idPlayer:plCloser.id, idZombie:zombie.id});
            }
        }else{//se for so tipo 1 e tiver a 200 não anda
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('moveZombie', {idZombie:zombie.id});
            }
        }
    }
}

function moveMage(){//mage move
    var plCloser
    var minor = 1000
    for(var pi in PLAYER_LIST){
        var player = PLAYER_LIST[pi]
        var dist = Math.sqrt(Math.pow(mage.x - player.x, 2) + Math.pow(mage.y - player.y, 2))
        if(minor > dist){
            plCloser = player
            minor = dist
        }
    }
    for(var i in SOCKET_LIST){
        SOCKET_LIST[i].emit('moveMage', {idPlayer:plCloser.id});
    }
}

function restrictionsLevel1(){
    return level == 1 && total_zombies < max_zombies_level1;
}

function restrictionsLevel2(){
    return level == 2 && mage.life > 0
}

setInterval(function(){
    if(readyToNextLevel && level != 3 & living_zombies > 0 && !playerDead){//zombie shoot
        shootZombie()
    }
    if(readyToNextLevel && level == 2 & mage.life > 0 && !playerDead){//mage shoot
        shootMage()
    }
}, 500);

function shootZombie(){//zombie shoot
    for(var ei in ZOMBIE_LIST){
        var zombie = ZOMBIE_LIST[ei]
        if(zombie.type != 2){
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('zombieShoot', {id:zombie.id, time:Date.now() - start});
            }
        }
    }
}

function shootMage(){//mage shoot
    for(var i in SOCKET_LIST){
        SOCKET_LIST[i].emit('mageShoot', {time:Date.now() - start});
    }
}