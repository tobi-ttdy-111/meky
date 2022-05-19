
// imports
const { request, response } = require( 'express' );
const bcrypjs = require( 'bcryptjs' );
const User = require( '../database/user' );


// postUser
const postUser = async( req = request, res = response ) => {

    const { email, name, password } = req.body;

    const user = new User({ email, name, password, role: 'user' });
    const salt = bcrypjs.genSaltSync( 10 );
    user.password = bcrypjs.hashSync( password, salt );

    await user.save();
    res.json({ user });

};


// exports
module.exports = {
    postUser,
};