
// Users
class Users {


    // constructor
    constructor() {

        this.users = {};
        this.actuals = {};
        this.chats = [];
        this.chats.push({ chat: [ 'general' ], messages: [] })

    };


    // get
    getUsers() { return Object.values( this.users ) };
    getActuals() { return Object.values( this.actuals ) };
    getGeneral() { return this.chats[ 0 ] }
    getChat( user1, user2 ) { return this.chats.find( chat => chat.chat.includes( user1 && user2 ) ) };


    // sendMessage
    sendMessage( message ) {
        this.chats.forEach( chat => {
            if ( chat.chat.includes( message.of && message.to ) ) {
                chat.messages.push({ name: message.name, message: message.message });
                return;
            };
        });
        this.chats.push({ chat: [ message.of, message.to ], messages: [{ name: message.name, message: message.message }] });
    };

    // sendMessage
    sendGeneral( message ) {
        this.chats.forEach( chat => {
            if ( chat.chat == 'general' ) { chat.messages.push( message ) };
        });
    };


    // conectUser
    conectUser( user ) {
        this.users[ user.id ] = user;
    };


    // putActuals
    putActuals( id, actual ) { this.actuals[ id ] = actual };
    putUsers( id, user ) { this.users[ id ] = user }


    // disconnectUser
    disconnectUser( id ) {
        delete this.users[ id ];
    };
    disconnectActual( id ) {
        delete this.actuals[ id ];
    };


};


// exports
module.exports = Users;