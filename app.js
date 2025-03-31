const path = require('path');

const express = require('express');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
// const Order = require('./models/order');
// const OrderItem = require('./models/orderItem');

const app = express();

// express will support ejs as view engine when we wil use the function for dynamic templates
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const e = require('express');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// new middleware to find the System user when the app is started
app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        // adding the sequlize user to the request object that will be passed to the controllers
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

//create the associations between the models
// user has products that he created
// when deleting a user the products will be deleted
Product.belongsTo(User, {
    foreignKey: 'createdById',
    constraints: true, 
    onDelete: 'CASCADE'
});
// the opposite relationship
User.hasMany(Product, {
    foreignKey: 'createdById',
    as: 'createdProducts'
});
// 
Product.belongsTo(User, {
    foreignKey: 'updatedById'
});
// the opposite relationship
User.hasMany(Product, {
    foreignKey: 'updatedById',
    as: 'updatedProducts'
});

// user has cart    
User.hasOne(Cart, {
    foreignKey: 'userId',
    constraints: true,
    onDelete: 'CASCADE'
});
Cart.belongsTo(User, {
    foreignKey: 'userId',
    constraints: true
});
Cart.belongsToMany(Product, {
    through: CartItem
})
Product.belongsToMany(Cart, {
    through: CartItem
})



// insure that all models are synced with the database - if no tables exist they will be created
sequelize
    .sync({force: false}) // {force: true} - need to remove force if we want to keep the tables, as in changes it will delete then and recreate them
    .then(result => {
        // create system dummy user 1 - first check if the user exist if not create it
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'System',
                email: 'doNotReplay@example.com',
                password: 'password'
            })
        } else {
            return user;
        }
    })
    .then(user => {
        console.log(user);
        return user.createCart();
    })
    .then(result => {
        app.listen(3000);
        console.log('Server started on port 3000');
    })
    .catch(err => {
        console.log(err);
    });