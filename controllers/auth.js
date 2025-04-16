const User = require('../models/user');
const bycrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        docTitle: 'Login',
        isAuthenticated: false,
        loginError: req.flash('error')[0]
    });

};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    isAuthenticated: false,
    signupError: req.flash('error')[0]
  });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        } else {
            console.log('logged User fetched');
            bycrypt.compare(password, user.password)
            .then(doMatch => {
                if (!doMatch) {
                    console.log('Password Mismatched');
                    req.flash('error', 'Invalid email or password');
                    return res.redirect('/login');
                } else {
                    console.log('Password Matched');
                    req.session.isLoggedIn = true;
                    req.session.user = user; 
                    return user.save()
                    .then(() => {
                        console.log('session saved');
                        res.redirect('/');
                    })
                    .catch(err => {
                        console.log(err)
                        req.flash('error', 'Generl error occurred');
                        return res.redirect('/login');
                    });
                }
            })
            .catch(err => {
                console.log(err)
                res.redirect('/login');
            });
        }
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
            req.flash('error', 'Email already exists');
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