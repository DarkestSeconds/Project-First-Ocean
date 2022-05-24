const mongoose = require('mongoose')

const localStrategy = require('passport-local').Strategy

const bcrypt = require('bcrypt')

// Model de usuaerio

require('../models/User')
const User = mongoose.model('users')


module.exports = (passport) => {

    passport.use(new localStrategy({ usernameField: 'username', passwordField: 'password' }, (user, password, done) => {

        User.findOne({ usuario: user }).then((user) => {
            if (!user) {
                return done(null, false, { message: "Conta inexistente" })
            }

            bcrypt.compare(password, user.senha, (err, same) => {
                if (same) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "Senha incorreta." })
                }
            })

        })

    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((_id, done) => {
        User.findById(_id, (err, user) => {
            if (err) {
                done(null, false, {message: err})
            } else {
                done(null, user)
            }

        })
    })

}