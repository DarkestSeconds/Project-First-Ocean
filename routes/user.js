const express = require('express')

const io = require('../app')

const router = express.Router()
const mongoose = require('mongoose')
const joi = require('joi')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { check, body, validationResult } = require('express-validator')
const fs = require('fs')
const path = require('path')
const { Script } = require('vm')

require('../models/User')
const User = mongoose.model('users')

require('../models/SubmitPhoto')
const Submit = mongoose.model('photos_submits')



//data list validation em json
//imagens de perfil
const images = require('../data/validation/images.json')







//Rotas

router.get('/register', (req, res) => {
    if (!req.user) return res.render('users/register', { title: "Registro - First Ocean" })
    res.redirect('/')
})

router.post('/register',
    check('username', "Usuário deve conter de 3 a 12 Letras e Numeros.").exists().isLength({ min: 3, max: 12 }),
    check('username', "Usuário deve conter apenas Letras e Números.").exists().isAlphanumeric(),
    check('password', "Senha deve conter de 6 a 18 caracteres.").exists().isLength({ min: 6, max: 18 }),
    check('genderOp', "Escolha seu gênero.").not().isEmpty(),
    (req, res, next) => {


        let errorPwConfirm = []

        if (req.body.password != req.body.password2) {
            errorPwConfirm.push({
                msg: "Senhas não são iguais."
            })
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const alerts = errors.array()
            return res.render('users/register', { errors: alerts, errorPW: errorPwConfirm, title: "| Register |" })

        }

        User.findOne({ usuario: req.body.username }).collation({locale: 'en', strength: 2}).then((username) => {
            if (username) {
                req.flash('err_msg', "Essa conta já existe.")
                return res.redirect('/register')
            } else {

                const newUser = {
                    usuario: req.body.username,
                    senha: req.body.password,
                    genero: req.body.genderOp,
                    imgPerfil: req.body.imgPerfil
                }



                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.senha, salt, (err, hash) => {
                        if (err) {
                            req.flash('err_msg', "Ocorreu um erro ao salvar o usuario.")
                            return res.redirect('/register')

                        }

                        newUser.senha = hash

                        new User(newUser).save().then(() => {
                            req.flash('success_msg', "Usuário cadastrado com sucesso.")
                            return res.redirect('/login')
                        }).catch((err) => {
                            req.flash('err_msg', "Houve um erro ao criar o usuário, espere um pouco e tente mais tarde.")
                            console.log(err)
                            return res.redirect('/')
                        })


                    })
                })

            }
        }).catch((err) => {
            req.flash('err_msg', "Houve um erro interno.")
            console.log(err)
            return res.redirect('/login')
        })

    })

router.get('/login', (req, res) => {
    if (!req.user) return res.render('users/login', { title: "Login - First Ocean" })
    res.redirect('/')

})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: true,
        failureRedirect: '/login',
        failureFlash: true,
        session: true

    })(req, res, next)


})


router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', "Deslogado.")
    res.redirect('/login')
})


let chatMessages = []
let allUsers = []
let rooms = {}
let queue = []
let names = []

var test = async (socket, userOn) => {

    let peer0 = queue[queue.length - 1]

    if (queue.length > 0) {


        peer0Cookie = peer0.handshake.headers.cookie
        socketCookie = socket.handshake.headers.cookie

        queue.splice(queue.indexOf(peer0), 1)


        if (peer0Cookie == socketCookie) allUsers.splice(allUsers.indexOf(userOn), 1)
        if (peer0Cookie == socketCookie) queue.splice(queue.indexOf(userOn.socket))
        console.log(allUsers)
        if (peer0Cookie == socketCookie) return socket.emit('sameUser')

        console.log(peer0Cookie)
        console.log(socketCookie)

        console.log(`${peer0.id} saiu do queue.`)
        console.log(queue)

        var room = `${socket.id}#${peer0.id}`

        peer0.join(room)
        socket.join(room)

        console.log(`${socket.id} e ${peer0.id} entraram na sala: ${room}`)

        peer0.emit('chat start', { 'id': socket.id, 'sala': room });
        socket.emit('chat start', { 'id': peer0.id, 'sala': room });
    } else {

        queue.push(socket)
        console.log(`${socket.id} entrou no queue`)
        log(queue)

    }

}


var log = arr => {
    console.log('Queue: ');
    for (let i = arr.length; i--;) {
        console.log(arr[i].id);
    }
    console.log('\n');
};



router.get('/chat', (req, res) => {

    if (!req.user) return res.redirect('/login')

    console.log('io')

    io.of("/chat").once('connection', async (socket) => {
        //usuario conectado + socket
        let userOn = {
            name: req.user.usuario,
            socket: socket.id,
            currentRoom: socket.rooms

        }

        allUsers.push(userOn)

        let logU = arr => {
            console.log('Queue: ');
            for (let i = arr.length; i--;) {
                console.log(arr[i].name);
            }
            console.log('\n');
        };

        logU(allUsers)


        test(socket, userOn)


        //Mensagem de chegada e saída do user no chat.
        socket.on('user', (user) => {
            socket.on('room', room => {
                socket.in(room.sala).emit('userArrive', user)

                socket.on('disconnect', () => {
                    socket.in(room.sala).emit('userLeft', user)
                    allUsers.splice(allUsers.indexOf(userOn), 1)
                    socket.emit('userReload')
                })
            })


        })

        console.log(`Conectado: ${socket.id}`)

        socket.on('room', room => {

            socket.on('sendMessage', data => {

                //checando se esta vazia
                if ((/^\s*$/).test(data.message) == false) {
                    chatMessages.push(data)
                    socket.to(room.id).emit('receivedMessage', data)
                }



            })

        })

        socket.on('room', room => {
            socket.on('disconnect', () => {
                console.log(`O usuario: ${userOn.name}#${userOn.socket} saiu do chat/room: ${room.sala}`)



            })
        })

        socket.on('reloaded', () => {
            socket.leave()
            allUsers.splice(allUsers.indexOf(userOn), 1)

        })

        socket.on('disconnect', () => {
            allUsers.splice(allUsers.indexOf(userOn), 1)


        })




    })

    if (req.user) return res.render('chat/chat', { messages: chatMessages, title: "Chat Privado" })

    res.redirect('/login')


})

router.get('/redirect', (req, res) => {

    setTimeout(() => {
        return res.redirect('/chat')
    }, 3000)
})



router.get('/perfil', (req, res) => {
    if (!req.user) return res.redirect('/login')

    //RENDERIZAR INFO DE ACORDO COM GENÊRO
    switch (req.user.genero) {
        case 'Masculino':
            res.render('users/perfil', { male: 'isMale', title: "Perfil - First Ocean" })
            console.log('homi')
            break;
        case 'Feminino':
            res.render('users/perfil', { female: 'isFemale', title: "Perfil - First Ocean" })
            console.log('muie')
            break;
        case 'Nao-binario':
            res.render('users/perfil', { noBinary: 'isNoBinary', title: "Perfil - First Ocean" })
            console.log('nop binary')
            break;
    }





})

router.post('/perfil', async (req, res, next) => {



    if (!req.user) return res.redirect('/')



    if (req.body.img_submit != "") {
        await Submit.findOne({ id_usuario: req.user.id }).then((userId) => {
            if (userId) {
                io.once('connection', socket => {
                    socket.emit('err_msg', "Aguarde, você já tem uma solicitação de imagem na fila.")
                })
            } else {

                let dataAtual = new Date()

                let dia = dataAtual.getDate()
                let mes = (dataAtual.getMonth() + 1)
                let ano = dataAtual.getFullYear()


                const newSubmit = {
                    id_usuario: req.user.id,
                    nome_usuario: req.user.usuario,
                    foto_enviada: req.body.img_submit,
                    data_de_envio_formatada: `${dia}/${mes}/${ano}`,
                    data_de_envio: dataAtual
                }

                new Submit(newSubmit).save().then().catch((err) => {
                    io.once('connection', socket => {
                        socket.emit('err_msg', "Ocorreu um erro ao registrar a solicitação.")
                    })


                })

            }
        })
    }



    if (req.body.imgPerfil != undefined && images.UserDefault.includes(req.body.imgPerfil) == true) {


        await User.findByIdAndUpdate(req.user.id, { $set: { imgPerfil: req.body.imgPerfil } }).then(() => {
            io.once('connection', socket => {
                socket.emit('success_msg', "Imagem de perfil alterada com sucesso.")
            })
        }).catch((err) => {
            io.once('connection', socket => {
                socket.emit('err_msg', "Ocorreu um erro ao alterar a foto.")
            })
        })
    } else if (req.body.imgPerfil != undefined && images.UserDefault.includes(req.body.imgPerfil) == false) {
        io.once('connection', socket => {
            socket.emit('err_msg', "Essa imagem não consta em nosso banco de dados.")
        })
    }





    //checando se o genêro faz parte dos disponiveis pelo site
    if (req.body.gender == 'Masculino' || req.body.gender == 'Feminino'|| req.body.gender == 'Nao-binario') {
        
        //genêro só é atualizado se for difrente do gênero atual do usuário
    if (req.body.gender != req.user.genero) {
        await User.findByIdAndUpdate(req.user.id, { $set: { genero: req.body.gender } }).then(() => {
            io.once('connection', socket => {
                socket.emit('success_msg', "Dados alterados com sucesso.")
            })
        }).catch((err) => {
            io.once('connection', socket => {
                socket.emit('err_msg', "Ocorreu um erro ao atualizar certos dados.")
            })
        })
    }

    } else {
        io.once('connection', socket => {
            socket.emit('err_msg', "O gênero escolhido é inexistente em nosso banco de dados.")
        })
    }


    



    res.redirect('/perfil')



})


router.get('/perfil/:username', (req, res) => {

    if (!req.user) return res.redirect('/login')

    
    User.findOne({usuario: req.params['username']}).collation({locale: 'en', strength: 2}).then((user) => {
        if (user) {
            return res.render('users/otherUserPerfil', {userFound: user, title: `${user.usuario} - Perfil`})
        } else {
            return res.render('users/otherUserPerfil', {title: "Usuário inexistente"})
        }
    }).catch((err) => {
        io.once('connection', socket => {
            socket.emit('err_msg', "Erro ao iniciar busca ao usuário.")
            return res.redirect('/')
        })
    })

    

    

})



module.exports = router