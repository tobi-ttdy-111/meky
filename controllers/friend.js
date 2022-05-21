
// imports
const { request, response } = require( 'express' );
const User = require( '../database/user' );


// getFriend
const getFriend = async( req = request, res = response ) => {

    const slopes = req.user.slopes;
    let listSlopes = [];

    const users = await User.find({ status: true });
    


    res.json({ users });

};


// putFriend
const putFriend = async( req = request, res = response ) => {

    const { id } = req.params;

    let user = await User.findById( id );
    if ( !user || !user.status ) { return res.status( 400 ).json({ 'errors': [{ msg: 'No se encontro a ningun usuario' }] }) };
    if ( user.id == req.user._id ) { return res.status( 400 ).json({ 'errors': [{ msg: 'No puedes enviarte una solicitud de amistad a ti mismo' }] }) }
    let { slopes = [] } = user;
    slopes.push( req.user._id );

    user = await User.findByIdAndUpdate( id, { slopes })
    res.json({ msg: `Solicitud enviada a ${ user.name }` });

};


// exports
module.exports = {
    putFriend,
    getFriend
};