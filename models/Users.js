
// Users
class Users {


    // constructor
    constructor() {

        this.users = {};
        this.actuals = {};
        this.chats = [];
        this.chats.push({ chat: [ 'general' ], messages: {} })

        //     {
        //         chat: [ '9823423246', '2937427834749087' ],
        //         messages: {  }
        //     }
        // ]

    };


    // get
    getUsers() { return Object.values( this.users ) };
    getActuals() { return Object.values( this.actuals ) };
    getMessages() { return this.messages };


    // sendMessage
    sendMessage( message ) {
        if ( message.to == 'general' ) {
            const chatGeneral = this.chats.find( chat => chat == 'general' );
            console.log( 'Chat general', chatGeneral )
        };
        this.chats.forEach( chat => {
            if ( chat.chat.includes( message.of && message.to ) ) {
                
            }
        })
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