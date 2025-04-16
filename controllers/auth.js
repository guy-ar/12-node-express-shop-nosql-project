const User = require('../models/user');
const bycrypt = require('bcryptjs');
const client = require('../config/secrets');

//const resend = new Resend(client.resendApiKey);
const nodemailer = require('nodemailer');
// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: client.gmailApiUser,
        pass: client.gmailApiKey // App Password, not your regular password
    },
    tls: {
        // This is the key part that resolves the certificate issue
        rejectUnauthorized: false
    },
    // Optional: Debug settings
    debug: true, // Set to true if you want to see detailed logs
});

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
            // Define email options
            const mailOptions = {
                from: client.gmailApiUser,
                to: email,
                subject: 'Welcome!',
                text: 'Hello! This is a test email sent from Node.js using Nodemailer for signup',
                html: '<h1>Hello!</h1><p>This is a test email sent from Node.js using Nodemailer for signup.</p>'
            };
  
            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    if (error.code === 'EAUTH') {
                        console.error('Authentication failed. Check your username and password.');
                      } else if (error.code === 'ESOCKET') {
                        console.error('Socket error. This could be related to network or firewall issues.');
                      } else if (error.code === 'ETIMEDOUT') {
                        console.error('Connection timed out. Check your network or try again later.');
                      }
                    return console.log('Error:', error);
                }
                console.log('Email sent:', info.response);
            });
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

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        docTitle: 'Reset Password',
        isAuthenticated: false,
        loginError: req.flash('error')[0]
    });

};