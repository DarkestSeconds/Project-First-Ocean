const express = require('express')

const io = require('../app')
const { isUser } = require('../helpers/isUser')

const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { check, validationResult } = require('express-validator')
const { Passport } = require('passport/lib')
const fs = require('fs')
const path = require('path')
const { contentType, set } = require('express/lib/response')
const res = require('express/lib/response')
require('../models/User')
const User = mongoose.model('users')




//Rotas

router.get('/register', (req, res) => {
    if (!req.user) return res.render('users/register')
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
            return res.render('users/register', { errors: alerts, errorPW: errorPwConfirm })

        }

        User.findOne({ usuario: req.body.username }).then((username) => {
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
                            return res.redirect('/register')
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
    if (!req.user) return res.render('users/login')
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
    res.redirect('/register')
})



let chatMessages = []
let allUsers = []
let rooms = {}
let queue = []
let names = []

var test = async (socket) => {

    if (queue.length > 0) {

        let peer0 = queue[queue.length - 1]

        queue.pop()

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

    io.once('connection', async (socket) => {
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


        test(socket)


        //Mensagem de chegada e saída do user no chat.
        socket.on('user', (user) => {
            socket.on('room', room => {
                socket.in(room.sala).emit('userArrive', user)

                socket.on('disconnect', () => {
                    socket.in(room.sala).emit('userLeft', user)
                    socket.emit('userReload')
                })
            })


        })

        console.log(`Conectado: ${socket.id}`)

        socket.on('room', room => {

            socket.on('sendMessage', data => {
                chatMessages.push(data)
                socket.to(room.id).emit('receivedMessage', data)

            })

        })

        socket.on('room', room => {
            socket.on('disconnect', () => {
                console.log(`O usuario: ${userOn.name}#${userOn.socket} saiu do chat/room: ${room.sala}`)




                userOn = {}
                allUsers.splice(allUsers.indexOf(userOn), 1)
                allUsers.pop()




            })
        })

        socket.on('reloaded', () => {
            socket.leave()
        })




    })

    if (req.user) return res.render('chat/chat', { messages: chatMessages })

    res.redirect('/login')


})



module.exports = router