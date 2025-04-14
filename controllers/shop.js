
const Product = require('../models/product');
const Order = require('../models/orders');

exports.getProducts = (req, res, next) => {
    // need to render the template using the view engine
    // we will pass to the template the products in js object
    Product.find()
    //.select('title price') // this will only return the title and price, and the id unless it is excluded using -_id
    //.populate('userId') // tell mongoose to populate the userId data based on tehe relationship
    .then(products => {
      console.log(products);
        res.render('shop/product-list', {
            prods: products, 
            docTitle: 'All Products',
            path: '/products'
          });
      })
      .catch(
      err => {
          console.log(err);
      }
    );
  }

exports.getIndex = (req, res, next) => {
  // need to render the template using the view engine
  // we will pass to the template the products in js object
  Product.find()
  .then(products => {
      res.render('shop/index', {
          prods: products, 
          docTitle: 'Shop',
          path: '/'
        });
  })
  .catch(
    err => {
        console.log(err);
    }
  );
  
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(user => {
    console.log(user.cart.items);
    const products = user.cart.items;
    res.render('shop/cart', {
      docTitle: 'Cart',
      path: '/cart',
      products: products
    })
  })
  .catch(
    err => {
        console.log(err);
    }
  );
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    console.log(product);
    return req.user.addToCart(product);
  })
  .then(result => {
    console.log(result);
    res.redirect('/cart');
  })
  .catch(err => console.log(err)); 
  
}

exports.postCartDeleteProduct= (req, res, next) => {
  const prodId = req.body.productId;
 req.user.deleteItemFromCart(prodId)
  .then((result) => {
    console.log(result);
    res.redirect('/cart');
  }).catch(err => console.log(err));
  
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders => {
    console.log('orders:');
    console.log(orders);
    res.render('shop/orders', {
      docTitle: 'Orders',
      path: '/orders',
      orders: orders
    })
  })
  .catch(err => console.log(err));
}

exports.postOrder = (req, res, next) => {
  req.user.getCart()
  .then(user => {
    console.log(user.cart.items);
    const products = user.cart.items.map(i => {
      return {quantity: i.quantity, product: {...i.productId._doc }} // in order to use the product object we need to use the spread operator and _doc
      // _doc is the object that contains the data of the product
    });
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      products: products
    });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));  
}

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    console.log(product);
    res.render('shop/product-details', {
      product: product,
      docTitle: product.title,
      path: '/products'
    })
  }).catch(err => console.log(err));  
}