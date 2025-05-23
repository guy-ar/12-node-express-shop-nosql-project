const isAuth = require('../middleware/is-auth');
const Product = require('../models/product');
const { validationResult} = require('express-validator');

const fileHelper = require('../util/file');
exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    buttonCaption: 'Add Product',
    productError: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false, 
      buttonCaption: 'Add Product',
      hasError: true,
      productError: 'Attached file is not an image',
      product: {
        title: title,
        description: description,
        price: price
      },
      validationErrors: []
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false, 
      buttonCaption: 'Add Product',
      hasError: true,
      productError: errors.array()[0].msg,
      product: {
        title: title,
        description: description,
        price: price
      },
      validationErrors: errors.array()
    });
  }
  const imageUrl = image.path;
  // as we have now a user with 2 realtios to product we need to use the alias mehtod
  const product = new Product({
    title: title, 
    imageUrl: imageUrl, 
    description: description, 
    price: price,
    userId: req.user // actually we save req.user._userId , but mongoose will do it for us
  });
  product.save()
    .then((result) => {
      console.log('Created Product');
      console.log(result);
      res.redirect('/admin/products');
    })
    .catch(err => {
      next(new Error(err));
    });
};
exports.getEditProducts = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        // better to move to error page - but for now we will redirect
        return res.redirect('/');
      }
      console.log(product);
      console.log(editMode);
      res.render('admin/edit-product', {
        docTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        buttonCaption: 'Update Product',
        product: product,
        hasError: false,
        productError: null,
        validationErrors: []
      });
    
    })
    .catch(err => {
      next(new Error(err));
    });
  
};

exports.postEditProducts = (req, res, next) => {
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;
  const updatedProdId = req.body.productId;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      buttonCaption: 'Update Product',
      productError: errors.array()[0].msg,
      hasError: true,
      product: {
        title: updatedTitle,
        description: updatedDescription,
        price: updatedPrice,
        productId: updatedProdId
      },
      validationErrors: errors.array()
    });
  }
  Product.findById(updatedProdId)
  .then((product) => {
    if (product && product.userId.toString() !== req.user._id.toString()) {
      // not allowed to edit products that don't belong to the user
      return res.redirect('/');
    }
    product.title = updatedTitle;
    if (updatedImage) {
      fileHelper.deleteFile(product.imageUrl); // delete the old image
      product.imageUrl = updatedImage.path;
    }
    product.description = updatedDescription;
    product.price = updatedPrice;
    return product.save().then((result) => {
      console.log('Updated Product');
      console.log(result);
      res.redirect('/admin/products');
    });
  })
  .catch(err => {
    next(new Error(err));
  });
};

exports.postDeleteProducts = (req, res, next) => {
  const prodIdToDelete = req.body.productId;
  console.log(prodIdToDelete);
  // in order to delete the image - need to fetch the imageUrl
  Product.findById(prodIdToDelete)
  .then((product) => {
    if (!product) {
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({ _id: prodIdToDelete, userId: req.user._id });
  })
  .then(() => {
    console.log('deleted');
    res.redirect('/admin/products');
  })
  .catch(err => {
    next(new Error(err));
  });
};

exports.deleteProduct = (req, res, next) => {
  const prodIdToDelete = req.params.productId;
  console.log("prodIdToDelete: ", prodIdToDelete);
  // in order to delete the image - need to fetch the imageUrl
  Product.findById(prodIdToDelete)
  .then((product) => {
    if (!product) {
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({ _id: prodIdToDelete, userId: req.user._id });
  })
  .then(() => {
    console.log('deleted');
    res.status(200).json({message: 'Product deleted'});
  })
  .catch(err => {
    res.status(500).json({message: 'Deleting product failed'});
  });
};
  
exports.getProducts = (req, res, next) => {
  // need to render the template using the view engine
  // we will pass to the template the products in js object
  Product.find({userId: req.user._id})
  .then(products => {
    res.render('admin/products', {
        prods: products, 
        docTitle: 'Admin Products',
        path: '/admin/products'
        });
    }).catch(err => {
      next(new Error(err));
    });

}