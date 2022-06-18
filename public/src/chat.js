$(document).ready(() => {

    var chatIsReady = false


    if (chatIsReady == false) {
        $('body').append('<object type="image/svg+xml" data="img/loading.svg" class="logo container">Loading</object>')
    }



    // const socket = io()
    const socket = io('/chat')




    function otherUser(user) {
        $('#otherUser').append(user)
    }



    function renderMessageSend(message) {
        $('#messagesSec').append(`<li class="d-flex user-select-none justify-content-end mb-4">
        <img src="${message.authorAvatar}" alt="avatar"
            class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="40">
        <div class="card mask-custom">
            <div class="card-header d-flex justify-content-start p-3"
                style="border-bottom: 1px solid rgba(37, 37, 37, 0.776);">
                <p class="fw-italic mb-0 user-select-all">${message.author.replace(/(<([^>]+)>)/ig, '')}</p>
            </div>
            <div class="card-body float-start user-select-all" id="message">
                <p class="mb-0">
                ${message.message.replace(/(<([^>]+)>)/ig, '')}
                </p>
            </div>
        </div>
    </li>`)

    }

    function renderMessageReceived(message) {
        $('#messagesSec').append(`<li class="d-flex justify-content-start user-select-none mb-4">
        <img src="${message.authorAvatar}" alt="avatar"
            class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="40">
        <div class="card mask-custom">
            <div class="card-header d-flex justify-content-start p-3"
                style="border-bottom: 1px solid rgba(37, 37, 37, 0.776);">
                <p class="fw-italic mb-0 user-select-all">${message.author.replace(/(<([^>]+)>)/ig, '')}</p>
            </div>
            <div class="card-body float-start user-select-all" id="message">
                <p class="mb-0">
                ${message.message.replace(/(<([^>]+)>)/ig, '')}
                </p>
            </div>
        </div>
    </li>`)

    }


    function notificationArrive(user) {

        otherUser(user)

        $('#textAreaToAppend').append('<textarea class="form-control rounded-2 bg-dark customTextArea" id="textArea" rows="4"></textarea>')
        $('#btnToAppend').append('<input type="submit" class="btn btn-dark btn-lg btn-rounded float-end" id="sendBtn" value="Enviar">')

        $('#messagesSec').append(`<li class="d-flex user-select-none mb-4">
        <div class="card mask-custom">
            <div class="card-body float-start user-select-all" id="message">
                <p class="mb-0">
               O Usuario <i>${user}</i> entrou no chat!
                </p>
            </div>
        </div>
    </li>`)

    }

    function notificationLeft(user) {

        $('#messagesSec').append(`<li class="d-flex user-select-none mb-4">
        <div class="card mask-custom">
            <div class="card-body float-start user-select-all" id="message">
                <p class="mb-0">
               O Usuario <i>${user}</i> deixou o chat!
                </p>
            </div>
        </div>
    </li>`)

    }


    function newChatButton() {
        $('body').append('<a href="/redirect"> <div id="newChatButtonDiv"> <div id="newChatBtn"> <span>Novo chat</span> </div> <br> <span>Use apenas o botão para iniciar um chat.</span> </div> </a>')
    }







    document.addEventListener("keypress", (event) => {
        if (event.key === "Enter" && chatIsReady === true) {
            $('#sendBtn').click()
        }
    })

    $('#chat').submit((event) => {
        event.preventDefault()



        var author = $('#user').val()
        var authorImg = $('#userImg').val()
        var message = $('#textArea').val()

        if (message.length) {
            var messageObject = {
                author: author,
                authorAvatar: authorImg,
                message: message
            }


            //checando se a mensagem está em branco. true = em branco, false = contém letras e numeros
            if ((/^\s*$/).test(message) == false) {
                renderMessageSend(messageObject)



                socket.emit('sendMessage', messageObject)


                //resetando area do texto
                $('#textArea').remove()

                $('#textAreaToAppend').append('<textarea class="form-control rounded-2 bg-dark customTextArea" id="textArea" rows="4"></textarea>')
            } else {

                //resetando area do texto
                $('#textArea').remove()

                $('#textAreaToAppend').append('<textarea class="form-control rounded-2 bg-dark customTextArea" id="textArea" rows="4"></textarea>')
            }


        }



    })

    socket.emit('user', $('#user').val())

    socket.on('userArrive', user => {
        notificationArrive(user)
    })

    socket.on('userLeft', user => {
        notificationLeft(user)
        $('#sectionTotal').remove()
        newChatButton()
        window.location.href = '/'

    })




    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {

        $('#sectionTotal').remove()
        newChatButton()

        socket.emit('reloaded')
        window.location.href = '/'

    }

    socket.on('receivedMessage', (message) => {
        renderMessageReceived(message)
    })

    socket.on('sameUser', () => {
        $(document).remove()
        window.location.href = '/redirect'
    })

    socket.on('chat start', (data) => {
        chatIsReady = true
        console.log(chatIsReady)

        socket.emit('room', data)
        sala = data.sala;

        if (chatIsReady == true) {
            $('#contain').removeClass('hiddenOpt')
            $('.logo').remove()
        }


    });




})

