
const token = localStorage.getItem( 'token' );
const user = JSON.parse( localStorage.getItem( 'user' ) );
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

const profileUser = document.querySelector( '#profileUser' );
const renderProfile = ( user ) => {if ( user.img ) {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">Binvenido!</small></div><div class="profile-photo"><div><img src="${ user.img }"></div></div>`;} else {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">¿Ya estás preparado?</small></div><span class="people"></span>`;};};
renderProfile( user );

const actualPassword = document.querySelector( '#actualPassword' );
const newPassword = document.querySelector( '#newPassword' );
const confirmPassword = document.querySelector( '#confirmPassword' );
const submitModifyPassword = document.querySelector( '#submitModifyPassword' );

const name = document.querySelector( '#name' );name.value = user.name;
const submitModifyData = document.querySelector( '#submitModifyData' );

const fileLabel = document.querySelector( '#fileLabel' );
file.addEventListener( 'change', () => { const nameFile = file.files[0].name;fileLabel.innerHTML = nameFile;});

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

submitModifyData.addEventListener( 'click', async( e ) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append( 'image', file.files[0] );
    formData.append( 'name', name.value );
    await fetch( `${ domain }/user/data`, {
        method: 'PUT',
        headers: { token },
        body: formData
    })
    .then( res => res.json() )
    .then( async( data ) => {
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
                    <small>Información actualizada<br> </small>
                    <div class="actions">
                        <input type="button" value="Aceptar" class="success all" id="ocultMessage">
                    </div>
                </form>
            `, undefined, 'ocultMessage', './index.html', undefined );
            await fetch( `${ domain }/user`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', token },
            })
            .then( res => res.json() )
            .then( data => {
                localStorage.setItem( 'user', JSON.stringify( data.user ) )
                renderProfile( data.user );
            });
        };
    });
});