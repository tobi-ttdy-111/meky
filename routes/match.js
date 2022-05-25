
// imports
const { Router } = require( 'express' );
const { postMatch } = require('../controllers/match');
const { validateJwt } = require( '../middlewares/validateJwt' );


// router
const router = Router();


// post /match
router.post( '/match', validateJwt, postMatch );


// exports
module.exports = router;