
// Users
class Users {


    // constructor
    constructor() {

        this.users = {};
        this.actuals = {};

    };


    // get
    getUsers() { return Object.values( this.users ) };
    getActuals() { return Object.values( this.actuals ) };


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