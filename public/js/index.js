
const token = localStorage.getItem( 'token' );
let user;try {user = JSON.parse( localStorage.getItem( 'user' ) );} catch ( err ) { window.location = './account.html';removeItem( 'token' );localStorage.removeItem( 'user' );};
if ( !token || !user ) {window.location = './account.html';removeItem( 'token' );localStorage.removeItem( 'user' );};

const profileUser = document.querySelector( '#profileUser' );
const renderProfile = ( user ) => {if ( user.img ) {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">Binvenido!</small></div><div class="profile-photo"><div><img src="${ user.img }"></div></div>`;} else {profileUser.innerHTML = `<div class="info"><p>Hola, <b>${ user.name }</b></p><small class="small-text">¿Ya estás preparado?</small></div><span class="people"></span>`;};};
renderProfile( user );
const messages = document.querySelector( '#messages' );
const messageCount = document.querySelector( '#messageCount' );
let chat = null;


// VALIDAR USER
const chargeInformation = async( socket ) => {
    await fetch( `${ domain }/init`,{
        method: 'GET',headers: { 'Content-Type': 'application/json', token },
    })
    .then( res => res.json() )
    .then( data => {
        if ( data.errors ) {
            let msgs = '';data.errors.forEach( err => { msgs += `<small>${ err.msg }</small><br>` });
            createMessage(`<form>${ msgs }<div class="actions"><input type="button" value="Restaurar conexion" class="danger all" id="ocultMessage"></div></form>`, 'err', 'ocultMessage', './account.html', undefined );localStorage.removeItem( 'token' );localStorage.removeItem( 'user' );
        } else {
            socketConnection();
            const users = data.users;
            let listFriends = [];
            let listSlopes = [];
            data.user.friends.forEach( friend => {
                const user = users.find( user => user._id == friend );
                listFriends.push( user );
            });
            data.user.slopes.forEach( slope => {
                const user = users.find( user => user._id == slope );
                listSlopes.push( user );
            });
            const ranking = users.sort( ( a, b ) => {
                if ( a.ppm > b.ppm ) { return -1 };
                if ( a.ppm < b.ppm ) { return 1 };
                return 0;
            });
            renderListFriends( listFriends );
            renderListSlopes( listSlopes );
            renderRankingFriends( listFriends );
            renderRanking( ranking[ 0 ], ranking[ 1 ], ranking[ 2 ] );
            preaparateAcept();
            preaparateDelete();
            if ( data.user != user ) {
                renderInfo( data.user );
                renderProfile( data.user );
                renderProgress( data.user );
                localStorage.setItem( 'user', JSON.stringify( data.user ) );
                user = data.user;
            };
            if ( socket ) { socket.emit( 'getActuals' ) };
        };
    });
}; chargeInformation();


// aleatoryColor
const aleatoryColor = () => {
    const random = parseInt( Math.random() * ( 4 - 1 ) + 1 );
    switch ( random ) {
        case 1: return 'primary';
        case 2: return 'success';
        case 3: return 'danger';
    };
};


let socket = null;
const socketConnection = () => {

    socket = io({ 'extraHeaders': { 'token': localStorage.getItem( 'token' ), 'actual': 'Conectado' }});

    socket.on( 'loadFriends', () => chargeInformation() );
    socket.on( 'updateFriend', ({ user, actual }) => {updateFriend( user._id, user, actual, undefined )});
    socket.on( 'chatGeneral', ( payload ) => renderChat( payload ) );
    socket.on( 'getChat', ( payload ) => renderChat( payload ));

    socket.on( 'sendMessage', ( payload ) => {
        if ( payload.to == 'general' ) {
            if ( chat != 'general' ) { messageCount.innerHTML = '▼'; messageCount.style.display = ''; return }
            if ( payload.to == 'general' ) {
                messages.innerHTML += `
                <div class="message">
                <p><span class="player ${ aleatoryColor() }">${ payload.name } </span></p>
                <p>${ payload.message }</p>
                </div>
                `;
                messages.scrollTop = 100000000000;
            };
            return;
        };
        if ( chat == payload.to ) {
            messages.innerHTML += `
                <div class="message">
                <p><span class="player ${ aleatoryColor() }">${ payload.name } </span></p>
                <p>${ payload.message }</p>
                </div>
            `;
            messages.scrollTop = 100000000000;
            return;
        };
        user.friends.forEach( friend => {
            if ( payload.to == friend ) {
                updateFriend( friend, payload.friend, 'Conectado', true )
            };
        });
    });

};


// renderChat
const renderChat = ( chat ) => {

    messages.innerHTML = '';
    if ( !chat ) return;
    chat.messages.forEach( message => {
        messages.innerHTML += `
            <div class="message">
            <p><span class="player ${ aleatoryColor() }">${ message.name } </span></p>
            <p>${ message.message }</p>
            </div>
        `;
    });

};


const chargeChat = () => {

    const chatWith = document.querySelector( '#chatWith' );
    const message = document.querySelector( '#message' );
    play.addEventListener( 'click', () => chat = null );
    progress.addEventListener( 'click', () => chat = null );
    ranking.addEventListener( 'click', () => chat = null );
    settings.addEventListener( 'click', () => chat = null );
    social.addEventListener( 'click', () => {
        chatWith.innerHTML = 'Chat general';
        chat = 'general';
        messageCount.style.display = 'none';
        messages.scrollTop = 100000000000;
        socket.emit( 'chatGeneral' );
    });
    const friends = document.querySelectorAll( '.friend' );
    friends.forEach( friend => {
        friend.addEventListener( 'click', () => {
            chat = friend.id;
            socialComponent();
            chatWith.innerHTML = `Chat con ${ friend.children[ 1 ].children[ 0 ].children[ 0 ].innerHTML }`;
            socket.emit( 'getChat', { user2: friend.id });
            const uy = friend.querySelector( '.uy' );
            if ( uy ) { friend.children[ 0 ].removeChild( uy ) }
        });
    });
    window.addEventListener( 'keypress', ( e ) => {
        if ( e.keyCode === 13 && chat != null && message.value.trim().length > 0 ) {
            socket.emit( 'sendMessage', { of: user._id, to: chat, message: message.value, name: user.name });
            message.value = '';
        };
    });

};


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
            <div class="item online friend" style="cursor: pointer;" id="${ friend._id }">
                ${ validateFriendImg( friend.img, undefined ) }
                <div class="right">
                    <div class="info">
                        <h3 class="name">${ friend.name }</h3>
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
    chargeChat();
};
const renderListSlopes = ( listSlopes ) => { slopesUser.innerHTML = ''; const count = listSlopes.length;if ( count > 0 ) { slopesCount.innerHTML = count; slopesCount.style.display = ''; } if ( count == 0 ) { slopesCount.innerHTML = '0'; slopesCount.style.display = 'none' } listSlopes.forEach( slope => {slopesUser.innerHTML += `<tr><td>${ slope.name }</td><td class="primary">${ slope.mp } mp</td><td class="success acept" id="${ slope._id }" style="cursor: pointer;">Aceptar</td><td class="danger delete" id="${ slope._id }" style="cursor: pointer">Rechazar</td></tr>`});};

const renderRankingFriends = ( listFriends ) => {

    listFriends.push( user );
    const listFriendsClean = listFriends.filter( Boolean );
    const rankingUsers = listFriendsClean.sort( ( a, b ) => {
        if ( a.ppm > b.ppm ) { return -1 };
        if ( a.ppm < b.ppm ) { return 1 };
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
                socket.emit( 'preaparateAcept', { id: acept.id });
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
                chargeInformation();
            };
        });
    }))
};


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
            <td>#${ match.rank }</td>
            <td class="success">${ match.date }</td>
            <td class="primary">${ match.ppm }ppm</td>
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
const renderRanking = ( userTop1, userTop2, userTop3 ) => {
    const validateFriendImg = ( img ) => { if ( img ) { return `<img src="${ img }" alt="persona1" class="profile-photo">` } else { return `<span class="material-icons-sharp">a</span>` }}
    top1.innerHTML = `
        ${ validateFriendImg( userTop1.img ) }
        <div class="middle">
            <div class="left">
                <h3 class="primary">TOP#1 ${ userTop1.name }</h3>
                <h1>${ userTop1.mp }mp</h1>
            </div>
        </div>
        <small class="small-text">ppm: ${ userTop1.ppm } <br>win rate: ${ userTop1.winrate }%</small>
    `;
    top2.innerHTML = `
        ${ validateFriendImg( userTop2.img ) }
        <div class="middle">
            <div class="left">
                <h3 class="danger">TOP#2 ${ userTop2.name }</h3>
                <h1>${ userTop2.mp }mp</h1>
            </div>
        </div>
        <small class="small-text">ppm: ${ userTop2.ppm } <br>win rate: ${ userTop2.winrate }%</small>
    `;
    top3.innerHTML = `
        ${ validateFriendImg( userTop3.img ) }
        <div class="middle">
            <div class="left">
                <h3 class="success">TOP#3 ${ userTop3.name }</h3>
                <h1>${ userTop3.mp }mp</h1>
            </div>
        </div>
        <small class="small-text">ppm: ${ userTop3.ppm } <br>win rate: ${ userTop3.winrate }%</small>
    `;
};


// RANKING
const top1 = document.querySelector( '#top1' );
const top2 = document.querySelector( '#top2' );
const top3 = document.querySelector( '#top3' );


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
const updateFriend = ( id, friend, actual, message ) => {
    const friendUser = document.getElementById( id );
    friendUser.innerHTML = `
    ${ validateFriendImg( friend.img, message ) }
        <div class="right">
            <div class="info">
                <h3>${ friend.name }</h3>
                <small class="small-text">${ actual || 'Desconectado' }</small>
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
            socket.emit( 'submitPutFriend', { id });
        };
    });
});

// logout
const logout = document.querySelector( '#logout' );
logout.addEventListener( 'click', () => {
    createMessage(`<form><small>¿Estas seguro de querer cerrar sesión?</small><div class="actions"><input type="button" value="Cerrar" class="danger all" id="ocultMessage"></div></form>`, undefined, 'ocultMessage', './account.html', undefined ); localStorage.removeItem( 'token' ); localStorage.removeItem( 'user' );
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
                socket.emit( 'submitPutFriend', { id });
            };
        });
    };

});


const normalMatch = document.querySelector( '#normalMatch' );
normalMatch.addEventListener( 'click', () => window.location = './game.html')