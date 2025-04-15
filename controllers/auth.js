const User = require('../models/user');
const bycrypt = require('bcryptjs');

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

};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    isAuthenticated: false
  });
};

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
        req.session.user.save((err) => {
            // in order to insure redirect is done after session is updated
            console.log(err);
            res.redirect('/');
        });
        
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // check if such user exists
    User.findOne({email: email}).
    then(userDoc => {
        if (userDoc) {
            // later on we will show error message
            return res.redirect('/signup');
        }
        return bycrypt.hash(password, 12)
        .then(hashedPassword => { 

            const user = new User({
                password: hashedPassword, 
                email: email,
                cart: {items: []}
            });
            return user.save(); 
        }).then(result => {
            console.log('Created User');
            res.redirect('/login');

        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    // method provided by session package
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
    
};