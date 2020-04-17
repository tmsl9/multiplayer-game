var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/',express.static(__dirname));

serv.listen(5500, '192.168.131.1');
var io = require('socket.io')(serv,{});
console.log("Server started.");
var start = Date.now()

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var total_players = 0;
var players_ready = 0;
const width = 640
const height = 640
var ENEMY_LIST = {};
var max_enemies = 5;
var num_enemies = 0;
let idEnemy = 1;
const enemyTimerDelay = 5000;

var Player = function(id){
    console.log("Client entered the game with id: ", id)
    var self = {
        x:id % 2 != 0 ? 200 : 400,///////
        y:400,
        life:100,
        id:id, //important information
        number:total_players,
        pos:"downplayer" + id,
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

var Enemy = function(x, y, id, type){
    //console.log("Enemy successfully created: ", id)
    var self = {
        x:x,
        y:y,
        life:100,/////
        id:id,
        dist:200,
        type:type
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

    socket.on('ready',function(){
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
                if(data.idEnemy){
                    SOCKET_LIST[player2.id].emit('life', {life:player.life, idEnemy:data.idEnemy})
                }else if(data.idBullet){
                    SOCKET_LIST[player2.id].emit('life', {life:player.life, idBullet:data.idBullet})
                }else{
                    SOCKET_LIST[player2.id].emit('life', {life:player.life})
                }
            }
        }
    });

    socket.on('lifeEnemy',function(data){
        for(var i in ENEMY_LIST){
            var enemy = ENEMY_LIST[i];
            if(enemy.id == data.idEnemy){
                enemy.life = data.life
                for(var j in PLAYER_LIST){
                    if(PLAYER_LIST[j].id != player.id){
                        var player2 = PLAYER_LIST[j]
                        SOCKET_LIST[player2.id].emit('lifeEnemy', {idEnemy:data.idEnemy, idBullet:data.idBullet, life:data.life})
                    }
                }
                if(enemy.life<=0){
                    num_enemies--;
                    //console.log(enemy.id,enemy.life,num_enemies);
                    delete ENEMY_LIST[enemy.id];
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
                    data.pos ? player.pos = data.pos : player.pos = player.pos
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
                //console.log("pack n",player2.id,"->",pack);
                SOCKET_LIST[player2.id].emit('playerAction', pack);
            }
        }
    });

    socket.on('enemyPosition',function(data){
        for(var i in ENEMY_LIST){
            var enemy = ENEMY_LIST[i];
            if(enemy.id == data.id){
                enemy.x = data.x
                enemy.y = data.y
                if(data.collider){
                    for(var i in PLAYER_LIST){
                        var player2 = PLAYER_LIST[i];
                        if(player2.id != player.id){
                            SOCKET_LIST[player2.id].emit('enemyPositionCollider', {id:enemy.id, x:enemy.x, y:enemy.y})
                        }
                    }
                }
            }
        }
    });
});

setInterval(function(){//criação do inimigo
    if(players_ready == 2 && num_enemies < max_enemies){
        let type;
        //console.log("enemy id:", idEnemy)
        let x ;
        let y ;
        let randNum= Math.floor(Math.random() *3);
        
        if(randNum==0){
            x = 0;
            y = Math.floor(Math.random() * (height));
        }else if( randNum == 1){
            x= width;
            y= Math.floor(Math.random() * (height));
        }else if(randNum ==2){
            x=Math.floor(Math.random() * (width));
            y=height;
        }

        let prob = Math.floor(Math.random() * 100+1);
        
        if(prob<=40){
            type=1;
        }else if(prob<=80){
            type=2;
        }else if(prob<=100){
            type=3;
        }
        
        idEnemy++;
        num_enemies++;
        
        //console.log("ENEMY",x,y, idEnemy);

        var enemy = Enemy(x, y, idEnemy, type);
        ENEMY_LIST[idEnemy] = enemy;
        
        for(var i in SOCKET_LIST){
            var socketEmit = SOCKET_LIST[i];
            socketEmit.emit('createEnemy', {x:x, y:y, idEnemy:idEnemy, type:type, life:enemy.life});
        }
    }
}, enemyTimerDelay);

setInterval(function(){//mover o inimigo
    if(players_ready == 2){
        for(var ei in ENEMY_LIST){
            var enemy = ENEMY_LIST[ei]
            
            var plCloser
            var minor = 100000
            for(var pi in PLAYER_LIST){
                var player = PLAYER_LIST[pi]
                var dist = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2))
                if(minor > dist){
                    plCloser = player
                    minor = dist
                }
            }
            if((enemy.type == 1 && enemy.dist < minor) || (enemy.type!=1)){
                for(var i in SOCKET_LIST){
                    var socketEmit = SOCKET_LIST[i];
                    socketEmit.emit('moveEnemy', {idPlayer:plCloser.id, idEnemy:enemy.id});
                }
            }else{ // se for so tipo 1 e tiver a 200 não anda
                for(var i in SOCKET_LIST){/////nao esta a resultar em alguns casos
                    var socketEmit = SOCKET_LIST[i];
                    socketEmit.emit('moveEnemy', {idEnemy:enemy.id});
                }
            }
            
        }
    }
}, 200);

setInterval(function(){//range o inimigo
    if(players_ready == 2){
        for(var ei in ENEMY_LIST){
            var enemy = ENEMY_LIST[ei]
            if(enemy.type == 1){
                //console.log("shoot-> ", enemy.id, enemy.type, enemy.x, enemy.y)
                for(var i in SOCKET_LIST){
                    var socketEmit = SOCKET_LIST[i];
                    socketEmit.emit('enemyShoot', {id:enemy.id, time:Date.now() - start});
                }
            }
        }
    }
}, 500);

////////////fazer o mover e o ataque aqui no server
////inicialmente fazer dist aqui, depois dist sempre nos jogadores, quando um dos jogadores enviar info que o player mais proximo mudou, fazer dist aqui
/// mover vai ser um problema vamos ter que saber as posiçoes exatas dos inimigos aqui no servidor