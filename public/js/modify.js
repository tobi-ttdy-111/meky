
const token = localStorage.getItem( 'token' );
const user = localStorage.getItem( 'user' );
if ( !token || !user ) {
    createMessage(`
        <form>
            <small>Hemos perdido la conexion con tu cuenta, porfavor vuelve a iniciar sesión <br> </small>
            <div class="actions">
                <input type="button" value="Aceptar" class="danger all" id="ocultMessage">
            </div>
        </form>
    `, 'err', 'ocultMessage', './account.html', undefined );
};

const actualPassword = document.querySelector( '#actualPassword' );
const newPassword = document.querySelector( '#newPassword' );
const confirmPassword = document.querySelector( '#confirmPassword' );
const submitModifyPassword = document.querySelector( '#submitModifyPassword' );

submitModifyPassword.addEventListener( 'click', async( e ) => {
    e.preventDefault();
    await fetch( `${ domain }/user/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({
            'actualPassword': actualPassword.value,
            'newPassword': newPassword.value,
            'confirmPassword': confirmPassword.value
        })
    })
    .then( res => res.json() )
    .then( data => {
        if ( data.errors ) {
            let msgs = '';
            data.errors.forEach( err => { msgs += `<small>${ err.msg }</small><br>` });
            createMessage(`
                <form>
                    ${ msgs }
                    <div class="actions">
                        <input type="button" value="Aceptar" class="danger all" id="ocultMessage">
                    </div>
                </form>
            `, undefined, 'ocultMessage', undefined, undefined );
        } else {
            createMessage(`
                <form>
                    <small>Tu contraseña a sido cambiada <br> </small>
                    <div class="actions">
                        <input type="button" value="Aceptar" class="success all" id="ocultMessage">
                    </div>
                </form>
            `, undefined, 'ocultMessage', './index.html', undefined );
        };
    });
});