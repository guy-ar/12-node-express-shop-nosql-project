const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class User {
    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart; // {items: []}
        this._id = id;
    }
    save() {
        const db = getDb();
        return db
            .collection('users')
            .insertOne(this)
            .then((result) => console.log('User inserted'))
            .catch((err) => console.log(err));
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            // must use toString as the id is a string when fetched from DB
            return cp.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items]; // create a copy of cart items if exist
        if (cartProductIndex >= 0) {
            // we already have the product in the cart - need to update the quantity
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            // we don't have the product in the cart - need to add it, with initial quantity of 1
            updatedCartItems.push({ productId: product._id, quantity: newQuantity });
        }

        const updatedCart = {
            items: updatedCartItems
        }
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                { _id: this._id }, // { _id: //mongodb.ObjectId.createFromHexString(this._id) },
                { $set: { cart: updatedCart } } // override only the old cart with new cart
            )
    }
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(i => {
            // we need only the product ids as array of ids (strings)
            // we do not need the quantity
            return i.productId;
        });
        return db
            .collection('products')
            .find({ _id: { $in: productIds } }) // array of ids will be fetched in the cursor
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        // we need to merge the data of product from DB as we keep only the product id on the cart
                        ...p,
                        quantity: this.cart.items.find(i => {
                            //need to complete the right quantity from the cart item per relevant product
                            return i.productId.toString() === p._id.toString();
                        }).quantity
                    };
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    deleteItemFromCart(productId) {
        // just to verify
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                { _id: this._id }, 
                { $set: { cart: { items: updatedCartItems } } } // override only the old cart with new cart
            )
    }

    addOrder() {
        const db = getDb();
        return this.getCart().then(products => {
            const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.name
                }
            };
            return db
                .collection('orders') // insert to order collection the contents of the cart
                .insertOne(order)
        })
        .then(result => { // empty the cart
            this.cart = { items: [] };
            return db
                .collection('users')
                .updateOne(
                    { _id: this._id },
                    { $set: { cart: { items: [] } } }
                )
        })
        .catch(err => {
            console.log(err);
        });
    }

    getOrders() {
        const db = getDb();
        return db
            .collection('orders')
            .find({ 'user._id': new mongodb.ObjectId(this._id) })
            .toArray()
    }


    static findById(id) {
        console.log("calling to User. findById()");
        console.log(id);
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: mongodb.ObjectId.createFromHexString(id) })
    }

}

module.exports = User; 