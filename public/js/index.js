
const token = localStorage.getItem( 'token' );
let user;try {user = JSON.parse( localStorage.getItem( 'user' ) );} catch ( err ) { window.location = './account.html';removeItem( 'token' );localStorage.removeItem( 'user' );};
if ( !token || !user ) {window.location = './account.html';removeItem( 'token' );localStorage.removeItem( 'user' );};

// VALIDAR USER
const validateUser = async() => {await fetch( `${ domain }/user`, {method: 'GET',headers: { 'Content-Type': 'application/json', token },}).then( res => res.json() ).then( data => {if ( data.errors ) {let msgs = '';data.errors.forEach( err => { msgs += `<small>${ err.msg }</small><br>` });createMessage(`<form>${ msgs }<div class="actions"><input type="button" value="Restaurar conexion" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined );localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );} else { socketConnection();if ( data.user != user ) { renderInfo( data.user ); renderProfile( data.user ); renderProgress( data.user ); localStorage.setItem( 'user', JSON.stringify( data.user ) ); user = data.user}};});};validateUser();

// LOAD FRIENDS
const loadFrieds = async() => {
    await fetch( `${ domain }/friend`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', token },
    })
    .then( res => res.json() )
    .then( data => {
        if ( data.errors ) {
            createMessage(`<form><small>Hemos perdido la conexion con tu cuenta</small><div class="actions"><input type="button" value="Restaurar conexion" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined ); localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );
        } else {
            renderListFriends( data.listFriends );
            renderListSlopes( data.listSlopes );
            renderRankingFriends( data.listFriends );
            preaparateAcept();
            preaparateDelete();
        };
    });
}; loadFrieds();

const friendsUser = document.querySelector( '#friendsUser' );
const slopesUser = document.querySelector( '#slopesUser' );
const slopesCount = document.querySelector( '#slopesCount' );
const rankingFriendsUser = document.querySelector( '#rankingFriendsUser' );
const validateFriendImg = ( img, mensajes ) => {if ( !img ) { if ( !mensajes ) { return `<span class="people"></span>` } else { return `<span class="people"><div class="uy"></div></span>` }};if ( img ) { if ( !mensajes ) { return `<div class="imgFriend"><img src="${ img }" alt="example"></div>` } else { return `<div class="imgFriend"><img src="${ img }" alt="example"><div class="uy"></div></div>` }  }};

const renderListFriends = ( listFriends ) => {
    friendsUser.innerHTML = '';
    listFriends.forEach( friend => {
        try {
            friendsUser.innerHTML += `
            <div class="item online" style="cursor: pointer;" id="${ friend._id }">
                ${ validateFriendImg( friend.img, undefined ) }
                <div class="right">
                    <div class="info">
                        <h3>${ friend.name }</h3>
                        <small class="small-text">Desconectado</small>
                    </div>
                    <h3 class="success">+ ${ friend.mp } mp</h3>
                </div>
            </div>
        `;
        } catch ( err ) {};
    });
    friendsUser.innerHTML += `
    <div class="item add-people" style="cursor: pointer;" id="addFriend">
        <div>
            <span class="material-icons-sharp">add</span>
            <h3>Añadir amigo</h3>
        </div>
    </div>`;
    const addFriend = document.querySelector( '#addFriend' );const formsFriend = document.querySelector( '#formsFriend' );if ( addFriend ) { addFriend.addEventListener( 'click', () => { msgBackground.style.top = '0%', formsFriend.style.top = '50%' }) };
};
const renderListSlopes = ( listSlopes ) => { slopesUser.innerHTML = ''; const count = listSlopes.length;if ( count > 0 ) { slopesCount.innerHTML = count; slopesCount.style.display = ''; } if ( count == 0 ) { slopesCount.innerHTML = '0'; slopesCount.style.display = 'none' } listSlopes.forEach( slope => {slopesUser.innerHTML += `<tr><td>${ slope.name }</td><td class="primary">${ slope.mp } mp</td><td class="success acept" id="${ slope._id }" style="cursor: pointer;">Aceptar</td><td class="danger delete" id="${ slope._id }" style="cursor: pointer">Rechazar</td></tr>`});};

const renderRankingFriends = ( listFriends ) => {

    listFriends.push( user );
    const rankingUsers = listFriends.sort( ( a, b ) => {
        if ( a.mp > b.mp ) { return -1 };
        if ( a.mp < b.mp ) { return 1 };
        return 0;
    });
    rankingFriendsUser.innerHTML = ``;
    rankingUsers.forEach( user => {
        rankingFriendsUser.innerHTML += `
        <tr>
            <td>${ user.name }</td>
            <td class="danger">${ user.mp }mp</td>
            <td class="success" >${ user.ppm }ppm</td>
            <td class="primary" >${ user.winrate }%</td>
        </tr>
        `
    })

};

const preaparateAcept = () => {
    const acetps = document.querySelectorAll( '.acept' );
    acetps.forEach( acept => acept.addEventListener( 'click', async() => {
        await fetch( `${ domain }/friend/${ acept.id }/acept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token },
        })
        .then( res => res.json() )
        .then( data => {
            if ( data.errors ) {
                createMessage(`<form>${ msgs }<div class="actions"><input type="button" value="Aceptar" class="danger all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', undefined, undefined );
            } else {
                loadFrieds();
                socket.emit( 'putUser' );
            };
        });
    }))
};
const preaparateDelete = () => {
    const deletes = document.querySelectorAll( '.delete' );
    deletes.forEach( delet => delet.addEventListener( 'click', async() => {
        await fetch( `${ domain }/friend/${ delet.id }/delete`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token },
        })
        .then( res => res.json() )
        .then( data => {
            if ( data.errors ) {
                createMessage(`<form>${ msgs }<div class="actions"><input type="button" value="Aceptar" class="danger all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', undefined, undefined );
            } else {
                loadFrieds();
            };
        });
    }))
};

// PROFILE USER
const profileUser = document.querySelector( '#profileUser' );
const renderProfile = ( user ) => {if ( user.img ) {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">Binvenido!</small></div><div class="profile-photo"><div><img src="${ user.img }"></div></div>`;} else {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">¿Ya estás preparado?</small></div><span class="people"></span>`;};};
renderProfile( user );

// PROGRESS
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
}; renderProgress( user );

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
}; renderInfo( user );


// RANKING
const top1 = document.querySelector( '#top1' );
const top2 = document.querySelector( '#top2' );
const top3 = document.querySelector( '#top3' );
const renderRanking = async() => {
    await fetch( `${ domain }/ranking`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', token },
    })
    .then( res => res.json() )
    .then( data => {
        if ( data.errors ) {
            console.err( 'Ocurrio un error al cargar el ranking' );
        } else {
            const validateFriendImg = ( img ) => { if ( img ) { return `<img src="${ img }" alt="persona1" class="profile-photo">` } else { return `<span class="material-icons-sharp">a</span>` }}
            top1.innerHTML = `
                ${ validateFriendImg( data.top1.img ) }
                <div class="middle">
                    <div class="left">
                        <h3 class="primary">TOP#1 ${ data.top1.name }</h3>
                        <h1>${ data.top1.mp }mp</h1>
                    </div>
                </div>
                <small class="small-text">ppm: ${ data.top1.ppm } <br>win rate: ${ data.top1.winrate }</small>
            `;
            top2.innerHTML = `
                ${ validateFriendImg( data.top2.img ) }
                <div class="middle">
                    <div class="left">
                        <h3 class="danger">TOP#2 ${ data.top2.name }</h3>
                        <h1>${ data.top2.mp }mp</h1>
                    </div>
                </div>
                <small class="small-text">ppm: ${ data.top2.ppm } <br>win rate: ${ data.top2.winrate }</small>
            `;
            top3.innerHTML = `
                ${ validateFriendImg( data.top3.img ) }
                <div class="middle">
                    <div class="left">
                        <h3 class="success">TOP#3 ${ data.top3.name }</h3>
                        <h1>${ data.top3.mp }mp</h1>
                    </div>
                </div>
                <small class="small-text">ppm: ${ data.top3.ppm } <br>win rate: ${ data.top3.winrate }</small>
            `;
        };
    });
}; renderRanking();


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

// UPDATE FRIEND UWUS
const updateFriend = ( id, friend ) => {
    const friendUser = document.getElementById( id );
    friendUser.innerHTML = `
        ${ validateFriendImg( friend.img, undefined ) }
        <div class="right">
            <div class="info">
                <h3>${ friend.name }</h3>
                <small class="small-text">${ friend.status }</small>
            </div>
            <h3 class="success">+ ${ friend.mp } mp</h3>
        </div>
    `;
};


const idFriendUser = document.querySelector( '#idFriendUser' );
const submitPutFriend = document.querySelector( '#submitPutFriend' );
const msgErrPutFriend = document.querySelector( '#msgErrPutFriend' );
submitPutFriend.addEventListener( 'click', async( e ) => {
    e.preventDefault();
    const id = idFriendUser.value || '000'
    await fetch( `${ domain }/friend/${ id }`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
    })
    .then( res => res.json() )
    .then( data => {
        if ( data.errors ) {
            msgErrPutFriend.innerHTML = data.errors[0].msg;
        } else {
            msgBackground.style.top = '-100%';
            formsFriend.style.top = '-50%';
            createMessage(`<form><small>${ data.msg }</small><div class="actions"><input type="button" value="Aceptar" class="success all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', undefined, undefined );
        };
    });
});

// logout
const logout = document.querySelector( '#logout' );
logout.addEventListener( 'click', () => {
    createMessage(`<form><small>¿Estas seguro de querer cerrar sesión?</small><div class="actions"><input type="button" value="Cerrar" class="danger all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', './account.html', 'logoutComponent' );
});


// KEY PRESS
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
    if ( e.keyCode === 13 && formsFriend.style.top == '50%' ) {
        e.preventDefault();
        const id = idFriendUser.value || '000'
        await fetch( `${ domain }/friend/${ id }`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token },
        })
        .then( res => res.json() )
        .then( data => {
            if ( data.errors ) {
                msgErrPutFriend.innerHTML = data.errors[0].msg;
            } else {
                msgBackground.style.top = '-100%';
                formsFriend.style.top = '-50%';
                createMessage(`<form><small>${ data.msg }</small><div class="actions"><input type="button" value="Aceptar" class="success all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', undefined, undefined );
            };
        });
    };

});


let socket = null;
const socketConnection = () => {

    socket = io({ 'extraHeaders': { 'token': localStorage.getItem( 'token' )}});
    socket.on( 'disconnect', () => { createMessage(`<form><small>Hemos perdido la conexion con tu cuenta</small><div class="actions"><input type="button" value="Restaurar conexion" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined ); localStorage.removeItem( 'token' ); localStorage.removeItem( 'user' )});

};