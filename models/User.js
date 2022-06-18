const mongoose = require('mongoose')
const Schema = mongoose.Schema



let dataAtual = new Date()

let dia = dataAtual.getDate()
let mes = (dataAtual.getMonth() + 1)
let ano = dataAtual.getFullYear()





const user = new Schema({
    usuario: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    genero: {
        type: String,
        required: true
    },
    imgPerfil: {
        type: String,
        default: 'img/usersPhotos/no_avatar.png'
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    data_de_criacao_formatada: {
        type: String,
        default: `${dia}/${mes}/${ano}`
    },
    data_de_criacao: {
        type: Date,
        default: dataAtual
    }
})

mongoose.model('users', user)