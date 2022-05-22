
// imports
const { Socket } = require( 'socket.io' );
const { validateJwt } = require('../helpers/validateJwt');


// socketController
const socketController = async( socket = new Socket(), io ) => {

    let user = await validateJwt( socket.handshake.headers[ 'token' ] );
    if ( !user ) { return socket.disconnect(); };

    // putUser
    socket.on( 'putUser', async() => { user = await validateJwt( socket.handshake.headers[ 'token' ] ); console.log( `Usuario actualizado ${ user }` ) });

    // here
    socket.join( user.id );

    // Limpiar cuando alguien se desconeta
    socket.on('disconnect', () => {
        console.log( 'Se desconecto' )
    });

};


// exports
module.exports = {
    socketController
};