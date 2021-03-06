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
var max_zombies_level1 = 15;//max em todo o nivel
var idZombie = 0;
const zombieTimerDelay = 5000;
var level = 0
var readyToText = false
var numReadyToText = 0
var readyToNextLevel = false
var numReadyToNextLevel = 0
var playerDead = false
var finish = 0
/**
 * Objeto jogador
 * @param {integer} id id do jogador
 */
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
/**
 * Objeto zombie
 * @param {integer} x posição do zombie em x
 * @param {integer} y posição do zombie em y
 * @param {integer} id id do zombie 
 * @param {integer} type  tipo do zombie
 */
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
/**
 * Objeto mago
 */
var Mage = function(){
    var self = {
        x:320,
        y:200,
        life:1000
    }

    return self;
}
/**
 * Cria um mago 
 */
var mage = Mage()
/**
 * Recebe novas conexões
 */
io.sockets.on('connection', function(socket){
    console.log("New connection", total_players + 1)/////make if 2 players are already playing
    total_players++;
    socket.id = total_players;
    SOCKET_LIST[socket.id] = socket;
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    player.emitId();

    /**
     * O jogo acaba reinicializa todas as variáveis, para o jogo poder recomeçar
     */
    socket.on('Finish',function(){
        finish++
        if(finish == 1){
            players_ready = 0;
            mage = Mage();
            living_zombies = 0;
            total_zombies = 0;
            level = 0;
            ZOMBIE_LIST = {};
            PLAYER_LIST = {};
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
        PLAYER_LIST[socket.id] = player;
    })
    /**
     * Um jogador se desconecta
     */
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        total_players--
        players_ready--
    });
    /**
     * Jogador está pronto para jogar
     */
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
    /**
     * Jogador clica em alguma tecla, incluindo rato, envia info para o outro jogador
     */
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
    /**
     * Atualização da vida do jogador, envia info para o outro jogador
     */
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
    /**
     * Atualização do tipo de balas do jogador, envia info para o outro jogador
     */
    socket.on('typeBullets',function(data){
        for(var i in PLAYER_LIST){
            var player2 = PLAYER_LIST[i];
            if(player2.id != player.id){
                player.typeBullets = data.typeBullets
                SOCKET_LIST[player2.id].emit('typeBullets', {typeBullets: player.typeBullets})
            }
        }
    });
    /**
     * Atualização da vida de um zombie, envia info para todos os jogadores
     */
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
    /**
     * Atualização do posicionamento dos zombies, envia info para todos os jogadores
     */
    socket.on('zombiePosition',function(data){
        for(var i in ZOMBIE_LIST){
            var zombie = ZOMBIE_LIST[i];
            if(zombie.id == data.id){
                zombie.x = data.x
                zombie.y = data.y
            }
        }
    });
    /**
     * Atualização da vida do mago, envia info para todos os jogadores
     */
    socket.on('lifeMage',function(data){
        mage.life = data.life
        for(var j in PLAYER_LIST){
            if(PLAYER_LIST[j].id != player.id){
                var player2 = PLAYER_LIST[j]
                SOCKET_LIST[player2.id].emit('lifeMage', {idBullet:data.idBullet, life:data.life})
            }
        }
    });
    /**
     * Atualização do posicionamento do mago, envia info para todos os jogadores
     */
    socket.on('magePosition',function(data){
        mage.x = data.x
        mage.y = data.y
    });
    /**
     * Atualização da vida de um zombie, envia info para todos os jogadores
     */
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
    /**
     * Atualização da vida de um zombie, envia info para todos os jogadores
     */
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
/**
 * Criação de um zombie de 5 em 5 segundos se tendo no máximo em campo 15 zombies no 1º
 * e se o mago não tiver morrido no 2º, envia info para todos os jogadores
 */
setInterval(function(){
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
/**
 * Movimentação dos zombies e/ou do mago de 200 em 200 milissegundos
 */
setInterval(function(){
    if(readyToNextLevel && level != 3 && living_zombies > 0 && !playerDead){//zombie move
        moveZombie()
    }
    if(readyToNextLevel && level == 2 && mage.life > 0 && !playerDead){//mage move
        moveMage()
    }
}, 200);
/**
 * Movimentação dos zombies, envia info para todos os jogadores
 */
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
/**
 * Movimentação do mago, envia info para todos os jogadores
 */
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
/**
 * Restrições para o nível 1 para a criação de zombies
 */
function restrictionsLevel1(){
    return level == 1 && total_zombies < max_zombies_level1;
}

function restrictionsLevel2(){
    return level == 2 && mage.life > 0
}
/**
 * zombies e/ou do mago disparam de 500 em 500 milissegundos
 */
setInterval(function(){
    if(readyToNextLevel && level != 3 & living_zombies > 0 && !playerDead){
        shootZombie()
    }
    if(readyToNextLevel && level == 2 & mage.life > 0 && !playerDead){
        shootMage()
    }
}, 500);
/**
 * Zombies disparam se não forem do tipo 2, envia info para todos os jogadores
 */
function shootZombie(){
    for(var ei in ZOMBIE_LIST){
        var zombie = ZOMBIE_LIST[ei]
        if(zombie.type != 2){
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('zombieShoot', {id:zombie.id, time:Date.now() - start});
            }
        }
    }
}
/**
 * Mago dispara, envia info para todos os jogadores
 */
function shootMage(){
    for(var i in SOCKET_LIST){
        SOCKET_LIST[i].emit('mageShoot', {time:Date.now() - start});
    }
}