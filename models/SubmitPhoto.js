const mongoose = require('mongoose')
const Schema = mongoose.Schema


const submit = new Schema({

    id_usuario: {
        type: String,
        required: true
    },

    nome_usuario: {
        type: String,
        required: true
    },

    foto_enviada: {
        type: String,
        required: true
    },

    data_de_envio_formatada: {
        type: String,
        required: true
    },

    data_de_envio: {
        type: Date,
        required: true
    }

    

})


mongoose.model('photos_submits', submit)