const User = require('../models/user');
const bycrypt = require('bcryptjs');
const client = require('../config/secrets');
const crypto = require('crypto');

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
        //isAuthenticated: false,
        resetError: req.flash('error')[0]
    });
};

exports.postReset = (req, res, next) => {
    // generate random bytes by size of 32 bits
    // it will be send to the user and used to verify the user
    // later on
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Generl error occurred');
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found.');
                console.log('No account with that email found.');
                return res.redirect('/reset');
            } 
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            return user.save()
        .then(result => {
            console.log('User saved');
            res.redirect('/');
            // Define email options
            const mailOptions = {
                from: client.gmailApiUser,
                to: req.body.email,
                subject: 'Password Reset',
                text: 'You requested a password reset. Click this link: http://localhost:3000/reset/' + token,
                html:
                `<h1>Password Reset</h1>
                <p>You requested a password reset. </p>
                <p>Click this: <a href="${client.serverUrl}:${client.serverPort}/reset/${token}">link</a> to set a new password.
                </p>
                <p>This link will expire in 1 hour.</p>
                <p>Thanks!</p>`
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
        })
        .catch(err => console.log(err));
    })
});
};

exports.getChangePassword = (req, res, next) => {
    const tokenId = req.params.tokenId;
    User.findOne({resetToken: tokenId, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        if (!user) {
            req.flash('error', 'Invalid or expired token.');
            return res.redirect('/login');
        }
        res.render('auth/change-password', {
            path: '/change-password',
            docTitle: 'Change Password',
            isAuthenticated: false,
            userId: user._id,
            tokenId: tokenId,
            chgPasswordError: req.flash('error')[0]
        });
        
    }).catch(err => console.log(err));
    
};

exports.postChangePassword = (req, res, next) => {
    const userId = req.body.userId;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const token = req.body.tokenId;
    let updatedUser;
    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/reset/${token}`);
    }
    User.findOne({_id: userId, resetToken: token, resetTokenExpiration: {$gt: Date.now()}})  
    .then(user => {
        if (!user) {
            req.flash('error', 'Invalid User or Token.');
            return res.redirect(`/reset/${token}`);
        }
        updatedUser = user;
        return bycrypt.hash(password, 12)
    }).then(hashedPassword => { 
        updatedUser.password = hashedPassword;
        updatedUser.resetToken = undefined;
        updatedUser.resetTokenExpiration = undefined;
        return updatedUser.save();
    })
    .then(() => {
        res.redirect('/login');
        // Define email options
        const mailOptions = {
            from: client.gmailApiUser,
            to: updatedUser.email,
            subject: 'Password Changed',
            text: 'Your password was changed.',
            html:
            `<h1>Password Changed</h1>
            <p>Your password was changed. You can now log in with your password. </p>
            <p>Thanks!</p>`
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
    })
    .catch(err => console.log(err));
};
