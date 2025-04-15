const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    // console.log("Cookies: ");
    // console.log(req.get('Cookie'));
    // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        path: '/login',
        docTitle: 'Login',
        isAuthenticated: false
    });

}

exports.postLogin = (req, res, next) => {
    // assume login is valid - later on we will validate the login
    // set on session flag for login
    
    
    User.findOne({name: 'system'})
    .then(user => {
        console.log('logged User fetched');
        console.log(user);
        req.session.isLoggedIn = true;
        req.session.user = user; 
        console.log(req.session.user);
        res.redirect('/');
    })
    .catch(err => console.log(err));

}