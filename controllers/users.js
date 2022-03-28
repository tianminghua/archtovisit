const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password)
    // login new user automatically
    req.login(newUser, err => {
        if (err) return next(err)
    })
    req.flash('success', `Welcome, ${newUser.username}`)
    res.redirect('/campgrounds')
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!!!!!!!!')
    if (req.session.returnTo) {
        const newUrl = req.session.returnTo
        delete req.session.returnTo
        res.redirect(newUrl)
    } else {
        res.redirect('/campgrounds')
    }

}

module.exports.logout = (req, res) => {
    req.logOut()
    req.flash('success', 'Goodbye~~~~~')
    res.redirect('/campgrounds')
}