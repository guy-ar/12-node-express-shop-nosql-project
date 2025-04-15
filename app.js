const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const app = express();

// express will support ejs as view engine when we wil use the function for dynamic templates
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
// const errorController = require('./controllers/error');
const e = require('express');
// const User = require('./models/user');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    console.log(req.user);
    User.findOne({name: 'system'})
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

mongoose.connect('***REMOVED***?appName=shop-db"')
.then((result) => {
    console.log('Connected to Database');
    User.findOne({name: 'system'})
    .then(user => {
        if (!user) {
            return new User({
                name: 'system', 
                email: 'doNotReply@examle.com',
                cart: {
                    items: []
                }
            }).save();
        }
    })
    return User.findOne({name: 'system'});
})
.then(user => {
    console.log(user);
    app.listen(3000)
})
.catch(err => console.log(err));
