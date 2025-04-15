const path = require('path');

const express = require('express');
const session = require('express-session');

const MONDODB_URI = mongoDbUri

// result of require is a function
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const User = require('./models/user');
const app = express();
const store = new MongoDBStore({
    uri: MONDODB_URI,
    collection: 'sessions'
})

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
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    // refresh the user model from the database
    User.findById(req.session.user._id)
        .then(user => {
            console.log('logged User fetched');
            console.log(user);
            
            req.user = user; 
            console.log(req.user);
            
            next();
        })
        .catch(err => console.log(err));
})
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(errorController.getErrorPage);

mongoose.connect(MONDODB_URI)
.then((result) => {
    console.log('Connected to Database');
    app.listen(3000)
})
.catch(err => console.log(err));
