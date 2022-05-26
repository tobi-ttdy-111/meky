
// imports
const { Socket } = require( 'socket.io' );
const { validateJwt } = require('../helpers/validateJwt');
const Users = require( '../models/Users' );


// users
const users = new Users();


// socketController
const socketController = async( socket = new Socket(), io ) => {

    // core
    let user = await validateJwt( socket.handshake.headers[ 'token' ] );
    let actual = socket.handshake.headers[ 'actual' ];
    if ( !user ) { return socket.disconnect(); };
    socket.join( user.id );
    socket.on( 'chatGeneral', () => {
        socket.emit( 'chatGeneral', users.getGeneral() );
    });

    // put logica
    users.conectUser( user );
    users.putActuals( user.id, actual );

    // emitir q me conecte we
    user.friends.forEach( friend => {
        socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );
        if ( actual != ( 'Editando perfil' || 'En partida' ) ) {
            if ( users.users[ friend ] ) {
                socket.emit( 'updateFriend', { user: users.users[ friend ], actual: users.actuals[ friend ] } );
            };
        };
    });

    // actualizar user
    socket.on( 'putUser', async() => {
        user = await validateJwt( socket.handshake.headers[ 'token' ] );
        users.putUsers( user.id, user );
        user.friends.forEach( friend => {
            socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );
        });
    });

    // enviar soli
    socket.on( 'submitPutFriend', ( payload ) => {socket.to( payload.id ).emit( 'loadFriends' );});

    // acepar soli
    socket.on( 'preaparateAcept', ( payload ) => {
        socket.to( payload.id ).emit( 'loadFriends' );
        socket.emit( 'loadFriends' );
        socket.on( 'getActuals', () => {
            socket.emit( 'updateFriend', { user: users.users[ payload.id ], actual: users.actuals[ payload.id ] } );
            socket.to( payload.id ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );
        });
    });

    // Limpiar cuando alguien se desconeta
    socket.on( 'disconnect', () => {
        users.disconnectUser( user.id );
        users.disconnectActual( user.id );
        setTimeout(() => {
            user.friends.forEach( friend => {socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );});
        }, 3000 );
    });

    // mensajes
    socket.on( 'sendMessage', ( payload ) => {
        if ( payload.to == 'general' ) {
            users.sendGeneral({ name: payload.name, message: payload.message });
            io.emit( 'sendMessage', { to: 'general', name: payload.name, message: payload.message });
            return
        } else {
            users.sendMessage( payload );
            socket.emit( 'sendMessage', { to: payload.to, name: user.name, message: payload.message });
            socket.to( payload.to ).emit( 'sendMessage', { to: payload.of, name: payload.name, message: payload.message, friend: user });
        };
    });
    socket.on( 'getChat', ({ user2 }) => {
        const chat = users.getChat( user.id, user2 );
        socket.emit( 'getChat', chat );
    });

};


// exports
module.exports = {
    socketController
};