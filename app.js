const path = require('path');

const express = require('express');
const mongoConnect = require('./util/database').mongoConnect;

const app = express();

// express will support ejs as view engine when we wil use the function for dynamic templates
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
// const errorController = require('./controllers/error');
const e = require('express');
const User = require('./models/user');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use((req, res, next) => {
    User.findById('67ec0b7063a4ca8a7476d153')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

mongoConnect(() => {
    app.listen(3000)
});
