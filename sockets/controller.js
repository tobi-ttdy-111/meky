
// imports
const { Socket } = require( 'socket.io' );
const { validateJwt } = require('../helpers/validateJwt');
const Users = require( '../models/Users' );


// users
const users = new Users();


// socketController
const socketController = async( socket = new Socket(), io ) => {

    let user = await validateJwt( socket.handshake.headers[ 'token' ] );
    let actual = socket.handshake.headers[ 'actual' ];
    if ( !user ) { return socket.disconnect(); };
    socket.join( user.id );

    users.conectUser( user );
    users.putActuals( user.id, actual );

    user.friends.forEach( friend => {
        socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );
        if ( actual != ( 'Editando perfil' || 'En partida' ) ) {
            if ( users.users[ friend ] ) {
                socket.emit( 'updateFriend', { user: users.users[ friend ], actual: users.actuals[ friend ] } );
            };
        };
    });

    socket.on( 'putUser', async() => {
        user = await validateJwt( socket.handshake.headers[ 'token' ] );
        users.putUsers( user.id, user );
        user.friends.forEach( friend => {
            socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );
        });
    });
    socket.on( 'submitPutFriend', ( payload ) => {socket.to( payload.id ).emit( 'loadFriends' );});
    socket.on( 'preaparateAcept', ( payload ) => {
        socket.to( payload.id ).emit( 'loadFriends' );
        socket.emit( 'loadFriends' );
        socket.on( 'getActuals', () => {
            socket.emit( 'updateFriend', { user: users.users[ payload.id ], actual: users.actuals[ payload.id ] } );
            socket.to( payload.id ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );
        });
    });

    // Limpiar cuando alguien se desconeta
    socket.on('disconnect', () => {
        users.disconnectUser( user.id );
        users.disconnectActual( user.id );
        user.friends.forEach( friend => {socket.to( friend ).emit( 'updateFriend', { user, actual: users.actuals[ user.id ] } );});
    });

};


// exports
module.exports = {
    socketController
};