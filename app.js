
const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const flash = require('connect-flash');
const client = require('./config/secrets');
const multer = require('multer');

const mongoose = require('mongoose');
// result of require is a function
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./models/user');
const app = express();
const store = new MongoDBStore({
    uri: client.mongoDbConnectionString,
    collection: 'sessions'
})
app.use(express.urlencoded({ extended: true }));
app.use(multer().single('image'));
app.use(cookieParser(client.cookieParserSecret));

// express will support ejs as view engine when we wil use the function for dynamic templates
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// flags for session: resave - save the session even if it is not modified; saveUninitialized - save the session even if it is not modified
// therefore set to false
// secret need to be a long random string
app.use(session({    
    secret: client.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store
}))

// Configure CSRF protection
const csrfProtectionConfig = {
    getSecret: () => client.csrfSecret,
    cookieName: 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        signed: true,
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getTokenFromRequest: (req) => req.body._csrf, // Explicitly tell it where to find the token
};
  
// Create CSRF protection middleware
const { generateToken, doubleCsrfProtection } = doubleCsrf(csrfProtectionConfig);
app.use(flash());

// // Debug middleware for incoming requests
// app.use((req, res, next) => {
//     if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
//         console.log("Request method:", req.method);
//         console.log("Request body:", req.body);
//     }
//     next();
// });

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = generateToken(req, res);
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    // refresh the user model from the database
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            console.log('logged User fetched');
                        
            req.user = user; 
            next();
        })
        .catch(err => {
            // inside a-sync function, we need to handle errors manually using next and not throw
            next(new Error(err));
        });
})



// Add global CSRF protection for all non-GET requests
app.use(doubleCsrfProtection);

// Set locals AFTER CSRF protection is applied
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    const token = generateToken(req, res);
    res.locals.csrfToken = token;
    console.log("Generated CSRF token:", token);
    next();
});

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

// Error handling middleware
app.use('/500', errorController.getGeneralErrorPage);

app.use(errorController.getNotFoundErrorPage);
// error handler - will be triggered when an error is thrown
app.use((error, req, res, next) => {
    // for now we will have only one error page 
    // we should not redirect - as we might have synch errors that 
    // will avoid new request to be sent
    console.log(error);
    res.status(500).render('500', {
        docTitle: 'Error Page',
        path: ''
    });
})

mongoose.connect(client.mongoDbConnectionString)
.then((result) => {
    console.log('Connected to Database');
    app.listen(3000)
})
.catch(err => console.log(err));
