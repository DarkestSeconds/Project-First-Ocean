// Modulos

const express = require('express')
const { engine } = require('express-handlebars')
const session = require('express-session')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const flash = require('connect-flash')

const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)


const {isUser} = require('./helpers/isUser')

module.exports = io


const path = require('path')



const passport = require('passport')
require('./configs/auth')(passport)

//routes

const users = require('./routes/user')



// Configs

//Mongoose

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Conectado ao MongoDB.")
}).catch((err) => {
    console.log(`Não foi possivel se conectar ao MongoDB: ${err}`)
})

// Sessão
app.use(session({
    secret: 'segredinho',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())


app.use(flash())


//Middleware

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.err_msg = req.flash('err_msg')


    //Auth

    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    res.locals.user = req.user || null

    next()
})


// BodyParser

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Handlebars

app.engine('handlebars', engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}))

app.set('view engine', 'handlebars')


//Public

app.use(express.static(path.join(__dirname, 'public')))


// Rotas

app.get('/', (req, res) => {
    if(req.user) return res.render('index')

    res.redirect('/login')
})












//Routes

app.use('/', users)



const PORT = process.env.PORT || 7777

server.listen(PORT, () => {
    console.log('Servidor online na porta: ' + PORT)
})


