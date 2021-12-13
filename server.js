var net = require('net');
var sockets = [];
var port = process.env.PORT || 21231;
var guestId = 0;
 
//aqui fica guardado todas as rooms
var rooms = []

//cria o server
var server = net.createServer(function(socket) {
    socket.nickname = '';
    socket.data = '';
    socket.room = -1;

    // Increment
    guestId++;
    
    var nickname = socket.nickname;

    // Welcome user to the socket
    //socket.write("Welcome to telnet chat!\n");
   /* json = {
        ola : 'kaka'
    }
    var buf = Buffer.from(JSON.stringify(json)); 
    socket.write( buf )*/

    // Broadcast to others excluding this socket
    //broadcast(clientName, clientName + ' joined this chat.\n');

    socket.on('connection', function(socket) {

    })

    // quando o cliente manda algum dado
    socket.on('data', function(data) {
        //pega o buffer do cliente e transforma em json
        //let _json = JSON.parse(data.toString().slice(12, data.toString().length-1));
        //console.log(data)

        socket.data += data.toString();
        console.log(data.toString())
        if(socket.data.charAt(socket.data.length-1) == '\0') {
            
            for(let _char = 0; _char < socket.data.length; _char++){
                var _character = socket.data.charAt(_char) 
                if(_character == '\0') {
                    console.log('entrou') 
                    _json = JSON.parse(socket.data.slice(0, _char)) 
                    socket.data = socket.data.slice(_char+1, socket.data.toString().length)
                }
            }
            //let _json = JSON.parse(socket.data.toString().slice(0, socket.data.toString().length-1))
            console.log(_json)

            //ve o tipo de dado para saber o que fazer
            switch(_json.type) {

                case 'server connect': //se conecta pela primeira vez ao server
                    nickname = _json.content
                    socket.nickname = _json.content;
                    console.log('se conectou ao server: '+socket.nickname)
                    sockets.push(socket);
                break;


                case 'create room': //criar sala
                    let _create_room = true;

                    //faz uma verficaçao para saber se o nome de sala nao esta sendo usado
                    for(let _index = 0; _index < rooms.length; _index++) {
                        if(rooms[_index].name == _json.content.name) {
                            _create_room = false;
                        }
                    }

                    if(_create_room) {
                        //adiciona a room na sala de rooms
                        rooms[rooms.length] = _json.content;
                        console.log(rooms)
     
                        socket.write(JSON.stringify({
                            type : 'create room response',
                            content : {
                                result : true,
                                name : _json.content.name,
                                password : _json.content.password,
                            },
                        }))
                    } else {  
                        socket.write(JSON.stringify({
                            type : 'create room response',
                            content : {
                                result : false,
                            },
                        }))
                    }
                break; 
                
                case 'room available':
                    let _rooms = [];
                    for(let _room = 0; _room < rooms.length; _room++) {
                        _rooms[_rooms.length] = { 
                            name : rooms[_room].name,
                        }
                    }
                    socket.write(JSON.stringify({
                        type : 'room available response',
                        content : _rooms,
                    })) 
                break;

                case 'join room':
                    let _join = false;
                    let _room_target = 0;

                    let _room_name = '';
                    //faz uma verficaçao para saber se o nome de sala nao esta sendo usado
                    var _stop_loop = false;
                    for(let _index = 0; _index < rooms.length && !_stop_loop; _index++) {
                        if(rooms[_index].name == _json.content.name) {
                            //se a senha estiver certa e a room estiver aberta
                            if(rooms[_index].password == _json.content.password) {
                                _join = true;
                                _stop_loop = true;
                                _room_target = _index;
                            }
                        }
                    }

                    if(_join) {

                        //adiciona o player na room
                        rooms[_room_target].players_waiting[ rooms[_room_target].players_waiting.length ] = _json.content.user;
                        rooms[_room_target].players_join_order[ rooms[_room_target].players_join_order.length ] = _json.content.user;
                        
                        socket.room = rooms[_room_target].name;
                        console.log(rooms)
                        //checa quem é o player q vai poder inciar a proxima partida
                        _stop_loop = false;
                        _player_master = ''
                        for(_name = 0; _name < rooms[index_of_room_name(socket.room)].players_join_order.length && !_stop_loop; _name++) {
                            if(check_player_in_room(index_of_room_name(socket.room), rooms[index_of_room_name(socket.room)].players_join_order[_name])){
                                _stop_loop = true;
                                _player_master = rooms[index_of_room_name(socket.room)].players_join_order[_name]
                            }
                        } 

     
                        socket.write(JSON.stringify({
                            type : 'join room response',
                            content : {
                                result : true,
                                players : rooms[_room_target].players,
                                players_waiting : rooms[_room_target].players_waiting,
                                game_start : rooms[_room_target].start,
                                player_master : _player_master
                            },
                        }))

                        //atualiza a lista de jogadores na sala, só para os jogadores que ja estao na room
                        let player_join_room_name = socket.nickname;
                        sockets.forEach(function(socket, index, array){
                            for(var _name = 0; _name < rooms[_room_target].players.length; _name++){
                                if(socket.nickname == rooms[_room_target].players[_name]) {
                                    if(player_join_room_name != socket.nickname) {
                                        socket.write(JSON.stringify({
                                            type : 'list players update',
                                            content : {
                                                players : rooms[_room_target].players,
                                                players_waiting : rooms[_room_target].players_waiting,
                                                game_start : rooms[_room_target].start,
                                                player_master : get_player_master_room(_room_target),
                                            }
                                        }))
                                        console.log('enviado para '+socket.nickname)
                                    }
                                }
                            }
                            for(var _name = 0; _name < rooms[_room_target].players_waiting.length; _name++){
                                if(socket.nickname == rooms[_room_target].players_waiting[_name]) {
                                    if(player_join_room_name != socket.nickname) {
                                        socket.write(JSON.stringify({
                                            type : 'list players update',
                                            content : {
                                                players : rooms[_room_target].players,
                                                players_waiting : rooms[_room_target].players_waiting,
                                                player_master : get_player_master_room(_room_target),
                                            }
                                        }))
                                        console.log('enviado para '+socket.nickname)
                                    }
                                }
                            }
                        })

                    } else {  
                        socket.write(JSON.stringify({
                            type : 'join room response',
                            content : {
                                result : false
                            },
                        }))
                    }
                break;

                case 'leave room':
                /*
                    index_room = index_of_room_name(socket.room)

                    index_player_in_players = rooms[index_room].players.findOf(socket.nickname) 
                    if(index_player_in_players != -1) {
                        rooms[index_room].players.splice(index_player_in_players, 1)
                    }

                    index_player_in_players_waiting = rooms[index_room].players_waiting.findOf(socket.nickname) 
                    if(index_player_in_players_waiting != -1) {
                        rooms[index_room].players.splice(index_player_in_players_waiting, 1)
                    }

                    index_player_in_join = rooms[index_room].join.findOf(socket.nickname) 
                    if(index_player_in_join != -1) {
                        rooms[index_room].players.splice(index_player_in_join, 1)
                    }*/
                    remove_player_of_room(socket)

                    socket.write(JSON.stringify({
                        type : 'leave room response',
                        content : true,
                    }))
                break;

                case 'room start':
                    console.log(socket.room)
                    console.log(rooms[index_of_room_name(socket.room)])
                    rooms[index_of_room_name(socket.room)].start = true;

                    let _index = index_of_room_name(socket.room);

                    for(_name = 0; _name < rooms[_index].players_waiting.length; _name++){
                        rooms[_index].players[rooms[_index].players.length] = rooms[_index].players_waiting[_name]

                    }
                    rooms[_index].deck = create_deck();
                    console.log(rooms[_index].deck)
                    fisher_yates_shuffle(rooms[_index].deck)
                    console.log('dando carta player')
                    players_cards = []

                    _stop_loop = false;
                    for(_ = 0; _ < 99 && !_stop_loop; _++) {
                        //escolhe uma primeira carta
                        _card_type = get_random(0, 3);
                        _card_color = get_random(0, 9);

                        _index_of_card = rooms[_index].deck.indexOf({ color : _card_color, type : _card_type })

                        if(_index_of_card != -1) {
                            rooms[_index].deck.splice(_index_of_card, 1); 
                            _stop_loop = true;
                        }
                    } 

                    _last_card = { color : _card_color, type : _card_type } 

                    for(player = 0; player < rooms[_index].players.length; player++){
                        players_cards.push({
                            name : rooms[_index].players[player],
                            deck : []
                        })
                        for(_ = 0; _ < 7; _++){
                            let _card = get_random(0, rooms[_index].deck.length-1)
                            console.log(_card)
                            players_cards[player].deck.push({
                                color : rooms[_index].deck[_card].color,
                                type : rooms[_index].deck[_card].type,
                            }) 
                            rooms[_index].deck.splice(_card, 1);
                        }
                    }

                    rooms[_index].players_cards = players_cards
                    rooms[_index].players_waiting = []

                    console.log(rooms[_index])

                    sockets.forEach(function(socket, index, array){
                        for(var _name = 0; _name < rooms[_index].players.length; _name++){
                             if(socket.nickname == rooms[_index].players[_name]) { 
                                socket.write(JSON.stringify({
                                    type : 'room start response',
                                    content : {
                                        players : rooms[_index].players,
                                        players_waiting : rooms[_index].players_waiting,
                                        players_cards : rooms[_index].players_cards,
                                        last_card : _last_card,
                                    }
                                })) 
                            }
                        }
                        for(var _name = 0; _name < rooms[_index].players_waiting.length; _name++){
                             if(socket.nickname == rooms[_index].players_waiting[_name]) { 
                                socket.write(JSON.stringify({
                                    type : 'room start response',
                                    content : {
                                        players : rooms[_index].players,
                                        players_waiting : rooms[_index].players_waiting,
                                        players_cards : rooms[_index].players_cards,
                                        last_card : _last_card,
                                    } 
                                })) 
                            }
                        }
                    })  
                break;

                case 'game update':
                    if(_json.content.winner == false) {
                        console.log("entrou")
                        //checa se o player jogou carta
                        if(_json.content.type == -1) { // NENHUMA CARTA FOI JOGADA
                            console.log("play")
                        } else {
                            for(player_card = 0; player_card < rooms[index_of_room_name(socket.room)].players_cards.length; player_card++) {
                                if(socket.nickname == rooms[index_of_room_name(socket.room)].players_cards[player_card].name) {
                                    console.log(rooms[index_of_room_name(socket.room)].players_cards[player_card])
                                    _index_of_card = rooms[index_of_room_name(socket.room)].players_cards[player_card].deck.indexOf({
                                        type : _json.content.type,
                                        color :  _json.content.color,
                                    })
                                    rooms[index_of_room_name(socket.room)].players_cards[player_card].deck.splice(_index_of_card, 1);
                                    console.log(rooms[index_of_room_name(socket.room)].players_cards[player_card])
                                }
                            }
                        }
                        for(let _room = 0; _room < rooms.length; _room++){
                            for(let _player = 0; _player < rooms[_room].players.length; _player++) {  
                                if(rooms[_room].players[_player] == _json.content.user) { 
                                    //manda para todos os clientes da sala(exceto a quem mandou)
                                    //que a ultima carta foi atualizada 
                                    let _card_block = false;
                                    switch(_json.content.type) {
                                        case 10: //carta bloquear
                                            _card_block = true;
                                        break;

                                        case 11: //carta inverter 
                                            rooms[_room].reverse *= -1;
                                        break; 
                                    }
                                    console.log('turno: '+rooms[_room].turn)
                                    //checa de qm é o proximo turno
                                    for(let _repeat = 0; _repeat <= _card_block; _repeat++) {
                                        if(rooms[_room].reverse == 1) {
                                            rooms[_room].turn += 1;
                                            if(rooms[_room].turn < rooms[_room].players.length) {} else {
                                                rooms[_room].turn = 0;
                                            }
                                        } else if(rooms[_room].reverse == -1) {
                                            rooms[_room].turn -= 1;
                                            if(rooms[_room].turn < 0) {
                                                rooms[_room].turn = rooms[_room].players.length-1;
                                            }
                                        }
                                    }
                                    console.log('turno: '+rooms[_room].turn)

                                    player_buy_card = _json.content.buy_card == 2 ? socket.nickname : -1
                                    for(let _update_player = 0; _update_player < rooms[_room].players.length; _update_player++){
                                        sockets.forEach(function(socket, index, array){
                                            _buy_card = player_buy_card != -1 && player_buy_card == socket.nickname? 2 : 0
                                            if(socket.nickname == rooms[_room].players[_update_player]) {
                                                socket.write( JSON.stringify({
                                                    type : 'game update',
                                                    content : {
                                                        color : _json.content.color,
                                                        type : _json.content.type,
                                                        effect : _json.content.effect,
                                                        turn : rooms[_room].turn,
                                                        buy_card : _buy_card,
                                                    }
                                                })) 
                                                  console.log('enviando para: ' +socket.nickname)
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    } else {
                        _index_room = index_of_room_name(socket.room);
                        _player_name = socket.nickname; 

                        //checa quem é o player q vai poder inciar a proxima partida
                        _stop_loop = false;
                        _player_master = ''
                        for(_name = 0; _name < rooms[_index_room].players_join_order.length && !_stop_loop; _name++) {
                            if(check_player_in_room(_index_room, rooms[_index_room].players_join_order[_name])){
                                _stop_loop = true;
                                _player_master = rooms[_index_room].players_join_order[_name]
                            }
                        } 


                        rooms[_index_room].start = false;

                        for(_name = 0; _name < rooms[_index_room].players.length; _name++){
                            rooms[_index_room].players_waiting[rooms[_index_room].players_waiting.length] = rooms[_index_room].players[_name]

                        }
                        rooms[_index_room].players = [] 
                        for(let _update_player = 0; _update_player < rooms[_index_room].players_waiting.length; _update_player++){
                            sockets.forEach(function(socket, index, array){
                                if(socket.nickname == rooms[_index_room].players_waiting[_update_player]) {
                                    socket.write( JSON.stringify({
                                        type : 'player win response',
                                        content : {
                                            player_win : _player_name,
                                            players : rooms[_index_room].players,
                                            players_waiting : rooms[_index_room].players_waiting,
                                            room_start : rooms[_index_room].start,
                                            player_master : _player_master,
                                        },
                                    }))  
                                }
                            })
                        } 
                    }
                break;

                case 'buy card':
                    _index_room = index_of_room_name(socket.room);
                    _player_name = socket.nickname;

                    index_in_players_deck = 0;
                    for(_name = 0; _name < rooms[_index_room].players_cards.length; _name++){
                        if(rooms[_index_room].players_cards[_name].name == _player_name) {
                            index_in_players_deck = _name;
                        }
                    }
                    _cards = [] 
                    if(rooms[_index_room].deck.length >= 1) {
                        for(_ = 0; _ < _json.content; _++){
                            let _card = get_random(0, rooms[_index_room].deck.length-1)
                            console.log(_card)
                            _cards.push({
                                color : rooms[_index_room].deck[_card].color,
                                type : rooms[_index_room].deck[_card].type,
                            }) 
                            rooms[_index_room].players_cards[index_in_players_deck].deck.push(_cards.length-1)
                            rooms[_index_room].deck.splice(_card, 1);
                        } 
                    }


                    for(let _update_player = 0; _update_player < rooms[_index_room].players.length; _update_player++){
                        sockets.forEach(function(socket, index, array){
                            if(socket.nickname == rooms[_index_room].players[_update_player]) {
                                socket.write( JSON.stringify({
                                    type : 'buy card response',
                                    content : {
                                        name : _player_name,
                                        card : _cards
                                    },
                                })) 
                            }
                        })
                    } 
                break;

                case 'say uno':
                    _index_room = index_of_room_name(socket.room);
                    _player_name = socket.nickname;
                        
                    for(let _update_player = 0; _update_player < rooms[_index_room].players.length; _update_player++){
                        sockets.forEach(function(socket, index, array){
                            if(socket.nickname == rooms[_index_room].players[_update_player]) {
                                socket.write( JSON.stringify({
                                    type : 'say uno response',
                                    content : _player_name,
                                })) 
                            }
                        })
                    } 
                break; 
            }
        }
    });


    // quando o cliente se desconecta
    socket.on('end', function() {

        //var message = clientName + ' left this chat\n';

        // Log it to the server output
        //process.stdout.write(message);

        // Remove client from socket array
        removeSocket(socket);

        // Notify all clients
        broadcast(clientName, message);
    });
    
    //socket.setTimeout(50000);

    socket.on('timeout', () => {
        console.log('socket timeout');
        remove_player_of_room(socket)  
    });

    socket.on('end', function(end) { 
        console.log('end socket: '+socket.nickname)
        remove_player_of_room(socket)  
    }); 


    // quando tem algum erro no cliente
    socket.on('error', function(error) {

        remove_player_of_room(socket)

        console.log('Socket got problems: ', error.message);

    });
});

function remove_player_of_server(socket) {

}
function remove_player_of_room(socket) {
    console.log('funçao chamada')
    //if(socket.room >= 0 && socket.room < rooms.length) {
        console.log('entrou')
        console.log(rooms[index_of_room_name(socket.room)])
    if(rooms[index_of_room_name(socket.room)] != undefined) {
        if(rooms[index_of_room_name(socket.room)].players.indexOf(socket.nickname) != -1) {
            rooms[index_of_room_name(socket.room)].players.splice(rooms[index_of_room_name(socket.room)].players.indexOf(socket.nickname), 1); 
        }
        console.log( rooms[index_of_room_name(socket.room)].players_waiting) 
        if(rooms[index_of_room_name(socket.room)].players_waiting.indexOf(socket.nickname) != -1) {
            rooms[index_of_room_name(socket.room)].players_waiting.splice(rooms[index_of_room_name(socket.room)].players_waiting.indexOf(socket.nickname), 1); 
        }
        console.log( rooms[index_of_room_name(socket.room)].players_join_order) 
        if(rooms[index_of_room_name(socket.room)].players_join_order.indexOf(socket.nickname) != -1) {
            rooms[index_of_room_name(socket.room)].players_join_order.splice(rooms[index_of_room_name(socket.room)].players_join_order.indexOf(socket.nickname), 1); 
        }

        console.log( rooms[index_of_room_name(socket.room)].players_waiting) 
        if(rooms[index_of_room_name(socket.room)].players.length == 0 && rooms[index_of_room_name(socket.room)].players_waiting.length == 0) {
            rooms.splice(index_of_room_name(socket.room), 1);
            console.log('room deletada')
        } else {
            console.log('atualizando para os outros players q alguem saiu')
            //atualiza a lista de jogadores na sala, só para os jogadores que ja estao na room
                        let _someone_player_win = false;
                        name_player_win = undefined
                        let _room_target = index_of_room_name(socket.room);
                        if(rooms[_room_target].players.length == 1){
                            _someone_player_win = true;
                            name_player_win = rooms[_room_target].players[0];

                            console.log(rooms[_room_target].players_waiting)
                            for(_name = 0; _name < rooms[_room_target].players.length; _name++){
                                rooms[_room_target].players_waiting.push(rooms[_room_target].players[_name])// [rooms[ _room_target].players_waiting.length] = rooms[_room_target].players[_name] 
                            }
                            console.log(rooms[_room_target].players_waiting)
                            rooms[_room_target].players = [] 
                        } 
                        sockets.forEach(function(socket, index, array){
                            for(var _name = 0; _name < rooms[_room_target].players.length; _name++){
                                if(socket.nickname == rooms[_room_target].players[_name]) {
                                    result_room = 0;
                                    if(_someone_player_win){ 
                                        rooms[_room_target].start = false
                                        result_room = {
                                            player_win : name_player_win,
                                            room_start : rooms[_room_target].start,
                                            players_waiting : rooms[_room_target].players_waiting,
                                            players : rooms[_room_target].players, 
                                        };
                                    }
                                    //if(player_join_room_name != socket.nickname) {
                                        socket.write(JSON.stringify({
                                            type : 'list players update',
                                            content : {
                                                players : rooms[_room_target].players,
                                                players_waiting : rooms[_room_target].players_waiting,
                                                player_master : get_player_master_room(_room_target), 
                                                result_room : result_room, 
                                            }
                                        }))
                                        console.log('enviado para update list '+socket.nickname)
                                    //}
                                }
                            }
                            for(var _name = 0; _name < rooms[_room_target].players_waiting.length; _name++){
                                if(socket.nickname == rooms[_room_target].players_waiting[_name]) {
                                    //if(player_join_room_name != socket.nickname) {
                                        result_room = 0; 
                                        if(_someone_player_win){ 
                                            rooms[_room_target].start = false
                                            result_room = {
                                                player_win : name_player_win,
                                                room_start : rooms[_room_target].start,
                                                players_waiting : rooms[_room_target].players_waiting,
                                                players : rooms[_room_target].players, 
                                            };
                                        }
                                        socket.write(JSON.stringify({
                                            type : 'list players update',
                                            content : {
                                                players : rooms[_room_target].players,
                                                players_waiting : rooms[_room_target].players_waiting, 
                                                player_master : get_player_master_room(_room_target),
                                                result_room : result_room,
                                            }
                                        }))
                                        console.log('enviado para update list '+socket.nickname)
                                    //}
                                }
                            }
                        })
        }
    }
   // }
}
 
function index_of_room_name(name) {
    for(let _room = 0; _room < rooms.length; _room++) {
        if(rooms[_room].name === name) {
            return _room;
        }
    }
    return -1;
}

function get_player_master_room(room) {
    //checa quem é o player q vai poder inciar a proxima partida 
    for(_name = 0; _name < rooms[room].players_join_order.length; _name++) {
        if(check_player_in_room(room, rooms[room].players_join_order[_name])){
            return rooms[room].players_join_order[_name]
        }
    } 
}

function check_player_in_room(room, name) {

    for(let _player_playing_name = 0; _player_playing_name < rooms[room].players.length; _player_playing_name++) {
        if(rooms[room].players[_player_playing_name] === name) {
            return true;
        }
    }
    for(let _player_waiting_name = 0; _player_waiting_name < rooms[room].players_waiting.length; _player_waiting_name++) {
        if(rooms[room].players_waiting[_player_waiting_name] === name) {
            return true;
        }
    }
    return false;
}

// Broadcast to others, excluding the sender
function broadcast(from, message) {

    // If there are no sockets, then don't broadcast any messages
    if (sockets.length === 0) {
        process.stdout.write('Everyone left the chat');
        return;
    }

    // If there are clients remaining then broadcast message
    sockets.forEach(function(socket, index, array){
        // Dont send any messages to the sender
        if(socket.nickname === from) return;
        
        socket.write(message);
    
    });
    
};

// Remove disconnected client from sockets array
function removeSocket(socket) {

    sockets.splice(sockets.indexOf(socket), 1);

};

function create_deck() {
    let _deck = []; 

    //quatro cores
    for(var _card_color = 0; _card_color <= 3; _card_color++) {
        //uma carta '0' e duas decks de 1-9
        for(let _card_type = 0; _card_type < 19; _card_type++){
            _deck.push({
                color : _card_color,
                type : Math.abs(_card_type-9),
            })
        }
        //cria 2 cartas de inverter, +2, bloquear
        for(let _type = 10; _type <= 12; _type++) {
            for(let _ = 0; _ < 2; _++) {
                _deck.push({
                    color : _card_color,
                    type : _type,
                })
            }
        } 
    }
    //cria 4 cartas de trocar cor e 4 de comprar +4
    for(let _card = 0; _card <= 8; _card++) {
        _deck.push({
            color : 0,
            type : _card % 2 == 0 ? 13 : 14,
        })
    }
    for(_ = 0; _ < _deck.length; _++) {
        console.log(_deck[_])
    }
    return _deck
}
function get_random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fisher_yates_shuffle(arr){
    for(var i =arr.length-1 ; i>0 ;i--){
        var j = Math.floor( Math.random() * (i + 1) ); //random index
        [arr[i],arr[j]]=[arr[j],arr[i]]; // swap
    }
}

// Listening for any problems with the server
server.on('error', function(error) {

    console.log("So we got problems!", error.message);

});

// Listen for a port to telnet to
// then in the terminal just run 'telnet localhost [port]'
server.listen(port, function() {

    console.log("Server listening at http://localhost:" + port);

});


