const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: { type: Number, required: true }
            }
        ]
    }
})
userSchema.methods.addToCart = function(product) {
    // adding new method for add product to cart that includethe previous logic of updating cart with quenatity of product
    // distinguish between cases wehre product is new and product exit
    // end eventaully save the updated cart on the user
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart;
    return this.save();
}
userSchema.methods.getCart = function() {
    return this.populate('cart.items.productId');
}

module.exports = mongoose.model('User', userSchema); 
