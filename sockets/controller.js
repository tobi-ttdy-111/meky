
// imports
const { Socket } = require( 'socket.io' );
const { validateJwt } = require('../helpers/validateJwt');
const { generarTexto } = require( '../helpers/generateText' );
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
        users.deleteTails( user.id );
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

    // match
    socket.on( 'findMatch', () => {
        let find;
        users.tails.forEach( tail => {
            if ( !find ) {
                const pairing = tail.mp - user.mp;
                if ( pairing <= 100 && pairing >= -100) { find = tail };
            };
        });
        if ( find ) {
            socket.to( find.id ).emit( 'findMatch', { user });
            socket.emit( 'findMatch', { user: find });
        };
        users.conectTail( user );
    });

    let text;
    socket.on( 'cancelMatch', ( payload ) => {
        users.deleteTails( user.id );
        socket.to( payload ).emit( 'cancelMatch' );
        text = null;
    });
    socket.on( 'aceptMatch', ( play ) => {
        users.deleteTails( user.id );
        if ( !text ) {
            text = generarTexto();
            socket.emit( 'genText', text );
        };
        socket.to( play.pvp ).emit( 'aceptMatch', { user, text } );
    });
    socket.on( 'qualifyingStarted', () => { users.deleteTails( user.id ); text = null });

    socket.on( 'phrasesQualify', ( payload ) => {
        socket.to( payload.to ).emit( 'phrasesQualify', { phrases: payload.phrases, user: payload.user } );
    });
    socket.on( 'finishQuialify', ( payload ) => {
        const date = new Date();
        payload.date = date;
        socket.emit( 'finishQuialify', ( payload ) );
        socket.to( payload.to ).emit( 'finishQuialify', ( payload ) );
    });


};


// exports
module.exports = {
    socketController
};