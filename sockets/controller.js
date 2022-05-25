
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
        user.friends.forEach( friend => {socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );});
    });

    // mensajes
    socket.on( 'sendMessage', ( payload ) => {
        // users.sendMessage( payload );
        // console.log( users.getMessages() );
        io.emit( 'sendMessage', { payload });
    });

};


// exports
module.exports = {
    socketController
};