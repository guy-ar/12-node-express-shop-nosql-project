
const Product = require('../models/product');
const Order = require('../models/orders');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); 
const ITEMS_PER_PAGE = 1;

// exports.getProducts = (req, res, next) => {
//     // need to render the template using the view engine
//     // we will pass to the template the products in js object
//     const page = +req.query.page || 1;
//     console.log("page: " + page);
//     let totalItems;
//     // limit the number of products per page using skip and limit
//     Product.find()
//     .countDocuments()
//     .then(numProducts => {
//       totalItems = numProducts;
//       return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
//     })
//     .then(products => {
//       res.render('shop/product-list', {
//         prods: products, 
//         docTitle: 'All Products',
//         path: '/products',
//         currentPage: page,
//         hasNextPage: ITEMS_PER_PAGE * page < totalItems,
//         hasPreviousPage: page > 1,
//         nextPage: +page + 1,
//         previousPage: page - 1,
//         lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
//       });
//     })
//     .catch(err => {
//       next(new Error(err));
//     });
//   }

// exports.getIndex = (req, res, next) => {
//   const page = +req.query.page || 1;
//   console.log("page: " + page);
//   let totalItems;
//   // limit the number of products per page using skip and limit
//   Product.find()
//   .countDocuments()
//   .then(numProducts => {
//     totalItems = numProducts;
//     return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
//   })
//   .then(products => {
//       res.render('shop/index', {
//           prods: products, 
//           docTitle: 'Shop',
//           path: '/',
//           currentPage: page,
//           hasNextPage: ITEMS_PER_PAGE * page < totalItems,
//           hasPreviousPage: page > 1,
//           nextPage: +page + 1,
//           previousPage: page - 1,
//           lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
//         });
//   })
//   .catch(err => {
//     next(new Error(err));
//   });
  
// }



const paginateProducts = (req, res, next, template, docTitle, path) => {
  const page = +req.query.page || 1;
  console.log("page: " + page);
  let totalItems;
  // limit the number of products per page using skip and limit
  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    res.render(template, {
      prods: products, 
      docTitle: docTitle,
      path: path,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: +page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    next(new Error(err));
  });
}

exports.getProducts = (req, res, next) => {
  paginateProducts(req, res, next, 'shop/product-list', 'All Products', '/products');
}

exports.getIndex = (req, res, next) => {
  paginateProducts(req, res, next, 'shop/index', 'Shop', '/');
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(user => {
    console.log('cart fetched');
    console.log(user.cart.items);
    const products = user.cart.items;
    res.render('shop/cart', {
      docTitle: 'Cart',
      path: '/cart',
      products: products
    })
  })
  .catch(err => {
    next(new Error(err));
  });
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
  .catch(err => {
    next(new Error(err));
  }); 
  
}

exports.postCartDeleteProduct= (req, res, next) => {
  const prodId = req.body.productId;
 req.user.deleteItemFromCart(prodId)
  .then((result) => {
    console.log(result);
    res.redirect('/cart');
  }).catch(err => {
    next(new Error(err));
  });
  
}

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
  .then(orders => {
    console.log('orders:');
    console.log(orders);
    res.render('shop/orders', {
      docTitle: 'Orders',
      path: '/orders',
      orders: orders
    })
  })
  .catch(err => {
    next(new Error(err));
  });
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
        email: req.user.email,
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
    .catch(err => {
      next(new Error(err));
    });  
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
  }).catch(err => {
    next(new Error(err));
  });  
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if (!order) {
      return next(new Error('No order found'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath)); // the PDF that we generate will also be stored in the file system
    pdfDoc.pipe(res);
       
    pdfDoc.fontSize(26).text('Invoice', {
      underline: true
    });
    pdfDoc.text('-----------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price);
    })
    pdfDoc.text('-----------------------');
    pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     next(new Error(err));
    //   }
    //   // in order to be bble to open the file in the browser we need to set the header
    //   res.setHeader('Content-Type', 'application/pdf');
    //   //res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); // tell teh browser to serve it as an attachment or inline
    //   res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    //   res.send(data);
    // })
    // const fileStream = fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    // fileStream.pipe(res); // pipe the file stream to the response by chunks
  })
  .catch(err => {
    next(new Error(err));
  })
  
}
