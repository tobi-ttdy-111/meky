
// imports
const { request, response } = require( 'express' );
const User = require( '../database/user' );


// postMatch
const postMatch = async( req = request, res = response ) => {

    const { type, rank, date, ppm } = req.body;
    const history = req.user.history;

    let ppmUser;
    if ( ppmUser == 0 ) {
        ppmUser = ppm;
    } else {
        ppmUser = (req.user.ppm + ppm)/2;
    };
    history.push({ type, rank, date, ppm });

    const user = await User.findByIdAndUpdate( req.user.id, ({ history, ppm: ppmUser, winrate: '100' }));
    res.json({ user });

};


// exports
module.exports = {
    postMatch
};