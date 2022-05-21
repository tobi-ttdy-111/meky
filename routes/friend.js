
// imports
const { Router } = require( 'express' );
const { check } = require( 'express-validator' );
const { putFriend,
        getFriend } = require( '../controllers/friend' );
const { validateJwt } = require( '../middlewares/validateJwt' );
const { validateReq } = require( '../middlewares/validateReq' );


// router
const router = Router();


// get /friend
router.get( '/friend', validateJwt, getFriend );


// put /friend/:id
router.put( '/friend/:id', [
    validateJwt,
    check( 'id', 'No es un id válido' ).isMongoId(),
    validateReq
], putFriend );


// exports
module.exports = router;