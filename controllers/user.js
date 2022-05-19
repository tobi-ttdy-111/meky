
// imports
const { request, response } = require( 'express' );
const bcrypjs = require( 'bcryptjs' );
const cloudinary = require( 'cloudinary' );
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


// put /user/password
const putUserPassword = async( req = request, res = response ) => {

    const { actualPassword, newPassword, confirmPassword } = req.body;

    const match = bcrypjs.compareSync( actualPassword, req.user.password );
    if ( !match ) return res.status( 400 ).json({ 'errors': [{ msg: 'La contraseña actual es incorrecta' }] });
    if ( newPassword != confirmPassword ) return res.status( 400 ).json({ 'errors': [{ msg: 'Las contraseñas no coinciden' }] });
    const salt = bcrypjs.genSaltSync( 10 );

    const user = await User.findByIdAndUpdate( req.user.id, { password: bcrypjs.hashSync( newPassword, salt ) } );
    res.json({ user });

};


// put /user/data
const putUserData = async( req = request, res = response ) => {

    const { name } = req.body;

    let img = req.user.img;
    if ( req.files ) {
        if ( img ) {
            const nameArr = img.split( '/' );
            const name = nameArr[ nameArr.length -1 ];
            const [ public_id ] = name.split( '.' );
            cloudinary.uploader.destroy( public_id );
        };
        const { archivo } = req.files;
        const { secure_url } = await cloudinary.uploader.upload( archivo.tempFilePath );
        img = secure_url;
    };

    const user = await User.findByIdAndUpdate( req.user._id, { name, img } );
    res.json({ user });

};


// exports
module.exports = {
    postUser,
    putUserPassword,
    putUserData
};