module.exports = {
    isUser: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next
        }

        req.flash('err_msg', "Você deve estar logado.")
        res.redirect('/login')

    }

}