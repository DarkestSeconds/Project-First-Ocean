const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')


const path = require('path')

require('../models/User')
const User = mongoose.model('users')

require('../models/SubmitPhoto')
const Submit = mongoose.model('photos_submits')





router.get('/submits', (req, res) => {

    if (!req.user) return res.redirect('/login')


    if (req.user.eAdmin != 1) return res.status(401).render('errors/err401')







    Submit.find().sort({ data_de_envio: 'desc' }).then((submits) => {
        res.render('admin/submits', { submit: submits, title: "Admin - First Ocean" })
    }).catch((err) => {
        req.flash('err_msg', "Ocorreu um erro ao renderizar os submits.")
        return res.redirect('/')
    })


})


router.post('/submits/accept', (req, res) => {

    //checando se é admin
    if (req.user.eAdmin = 1) {

        Submit.findById(req.body.id_submit).then((submit) => {
            if (submit) {
                User.findByIdAndUpdate(req.body.id_usuario, { $set: { imgPerfil: submit.foto_enviada } }).then(() => {
                    req.flash('success_msg', "Solicitação foi aceita.")

                    Submit.findByIdAndDelete(submit.id).then().catch((err) => {
                        req.flash('err_msg', "Ocorreu um erro ao remover o submit.")
                        return res.redirect('/admin/submits')
                    })

                    return res.redirect('/admin/submits')


                }).catch((err) => {
                    req.flash('err_msg', "Ocorreu um erro ao alterar a foto do usuario.")
                    console.log(err)
                    return res.redirect('/admin/submits')
                })
            } else {
                req.flash('err_msg', "Usuário não encontrado.")
                return res.redirect('/admin/submits')
            }
        }).catch((err) => {
            req.flash('err_msg', "Ocorreu um erro ao tentar encontrar a solicitação.")
            return res.redirect('/admin/submits')
        })
    }




})

router.post('/submits/denied', (req, res) => {

    //checando se é admin
    if (req.user.eAdmin = 1) {
        Submit.findByIdAndDelete(req.body.id_submit).then(() => {
            req.flash('success_msg', "Submit negado.")
            return res.redirect('/admin/submits')
        }).catch((err) => {
            req.flash('err_msg', "Ocorreu um erro ao negar o submit.")
            return res.redirect('/admin/submits')
        })
    }



})






module.exports = router