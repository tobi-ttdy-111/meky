
const token = localStorage.getItem( 'token' );
let user;try {user = JSON.parse( localStorage.getItem( 'user' ) );} catch ( err ) { window.location = './account.html';removeItem( 'token' );localStorage.removeItem( 'user' );};
if ( !token || !user ) {window.location = './account.html';removeItem( 'token' );localStorage.removeItem( 'user' );};

const profileUser = document.querySelector( '#profileUser' );
const renderProfile = ( user ) => {if ( user.img ) {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">Binvenido!</small></div><div class="profile-photo"><div><img src="${ user.img }"></div></div>`;} else {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">¿Ya estás preparado?</small></div><span class="people"></span>`;};};
renderProfile( user );

const ppmUser = document.querySelector( '#ppmUser' );
const ppmUserNumber = document.querySelector( '#ppmUserNumber' );
const winrateUser = document.querySelector( '#winrateUser' );
const winrateUserNumber = document.querySelector( '#winrateUserNumber' );
const mpUser = document.querySelector( '#mpUser' );
const mpUserNumber = document.querySelector( '#mpUserNumber' );
const historyUser = document.querySelector( '#historyUser' );
const renderProgress = ( user ) => {
    ppmUser.innerHTML = `${ user.ppm }ppm`;ppmUserNumber.innerHTML = user.ppm;winrateUser.innerHTML = `${ user.winrate }%`;winrateUserNumber.innerHTML = user.winrate;mpUser.innerHTML = `${ user.mp }mp`; mpUserNumber.innerHTML = user.mp;
    user.history.forEach( match => {
        historyUser.innerHTML += `
        <tr>
            <td>${ match.type }</td>
            <td>${ match.rank }</td>
            <td class="success">${ match.date }</td>
            <td class="primary">${ match.ppm }</td>
        </tr>
        `
    });
};
renderProgress( user );

const informationUser = document.querySelector( '#informationUser' );
const renderInfo = ( user ) => {
    if ( user.img ) {
        informationUser.innerHTML = `
            <img src="${ user.img }" class="profile-photo">
            <div class="middle">
                <div class="left">
                    <h3 class="primary">${ user.name }</h3>
                    <h1>${ user.mp }mp</h1>
                </div>
            </div>
            <small class="small-text">Correo: ${ user.email }<br><id id="idUser" style="cursor: pointer;">Id: ${ user._id }</id><textarea id="idUserCopy" style="position: absolute; top: -100%;">${ user._id }</textarea><br><copied id="alertCopied" class="success" style="display: none;">Id copiado !</copied></small>
        `;
    } else {
        informationUser.innerHTML = `
            <span class="material-icons-sharp">a</span>
            <div class="middle">
                <div class="left">
                    <h3 class="">${ user.name }</h3>
                    <h1>${ user.mp }mp</h1>
                </div>
            </div>
            <small class="small-text">Correo: ${ user.email }<br><id id="idUser" style="cursor: pointer;">Id: ${ user._id }</id><textarea id="idUserCopy" style="position: absolute; top: -100%;">${ user._id }</textarea><br><copied id="alertCopied" class="success" style="display: none;">Id copiado !</copied></small>
        `;
    };
    const idUser = document.querySelector( '#idUser' );
    idUser.addEventListener( 'click', () => { const idUserCopy = document.querySelector( '#idUserCopy' ); idUserCopy.select(); document.execCommand('copy'); const alertCopied = document.querySelector( '#alertCopied' ); alertCopied.style.display = '';
    setTimeout( function() { alertCopied.style.display = 'none' }, 5000)});
};
renderInfo( user );

const validateUser = async() => {await fetch( `${ domain }/user`, {method: 'GET',headers: { 'Content-Type': 'application/json', token },}).then( res => res.json() ).then( data => {if ( data.errors ) {let msgs = '';data.errors.forEach( err => { msgs += `<small>${ err.msg }</small><br>` });createMessage(`<form>${ msgs }<div class="actions"><input type="button" value="Restaurar conexion" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined );localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );} else {
    if ( data.user != user ) { renderInfo( data.user ); renderProfile( data.user ); renderProgress( data.user ); localStorage.setItem( 'user', JSON.stringify( data.user ) ); user = data.user}};});};validateUser();

const logout = document.querySelector( '#logout' );
logout.addEventListener( 'click', () => {
    createMessage(`<form><small>¿Estas seguro de querer cerrar sesión?</small><div class="actions"><input type="button" value="Cerrar" class="danger all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', './account.html', undefined ); localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );
});

const passwordDelete = document.querySelector( '#passwordDelete' );
const submitDelete = document.querySelector( '#submitDelete' );
const msgErrDelete = document.querySelector( '#msgErrDelete' );
submitDelete.addEventListener( 'click', async( e ) => {
    e.preventDefault();
    await fetch( `${ domain }/user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({
            'password': passwordDelete.value
        })
    })
    .then( res => res.json() )
    .then( data => {
        if ( data.errors ) {
            msgErrDelete.innerHTML = data.errors[0].msg;
        } else {
            msgBackground.style.top = '-100%';
            formsDelete.style.top = '-50%';
            createMessage(`<form><small>Has eliminado tu cuenta, si te gusta mekymaa y quieres seguir jugando deberás volver a iniciar sesión en otra cuenta</small><div class="actions"><input type="button" value="Iniciar sesión en otra cuenta" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined ); localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );
        };
    });
});


window.addEventListener( 'keypress', async( e ) => {

    if ( e.keyCode === 13 && formsDelete.style.top == '50%' ) {
        e.preventDefault();
        await fetch( `${ domain }/user`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', token },
            body: JSON.stringify({
                'password': passwordDelete.value
            })
        })
        .then( res => res.json() )
        .then( data => {
            if ( data.errors ) {
                msgErrDelete.innerHTML = data.errors[0].msg;
            } else {
                msgBackground.style.top = '-100%';
                formsDelete.style.top = '-50%';
                createMessage(`<form><small>Has eliminado tu cuenta, si te gusta mekymaa y quieres seguir jugando deberás volver a iniciar sesión en otra cuenta</small><div class="actions"><input type="button" value="Iniciar sesión en otra cuenta" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined ); localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );
            };
        });
    };

})
