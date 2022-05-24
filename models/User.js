const mongoose = require('mongoose')
const Schema = mongoose.Schema


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
    }
})

mongoose.model('users', user)