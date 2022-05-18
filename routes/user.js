
// imports
const { Router } = require( 'express' );
const { check } = require( 'express-validator' )
const { postUser } = require( '../controllers/user' );
const { validateReq } = require( '../middlewares/validateReq' );
const { existsEmail } = require( '../helpers/validations' );


// router
const router = Router();


// post /user
router.post( '/user', [
    check( 'email', 'El correo no es válido' ).isEmail(),
    check( 'email' ).custom( existsEmail ),
    check( 'name', 'Introduce tu nombre' ).notEmpty(),
    check( 'password', 'Contraseña debe ser mayor a 5 carácteres' ).isLength({ min: 6 }),
    validateReq
], postUser );


// exports
module.exports = router;