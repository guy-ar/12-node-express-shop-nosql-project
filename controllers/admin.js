const Product = require('../models/product');
exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    buttonCaption: 'Add Product'
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
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
    .catch(err => console.log(err));
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
        product: product
      });
    
    })
    .catch(err => console.log(err));
  
};

exports.postEditProducts = (req, res, next) => {
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;
  const updatedProdId = req.body.productId;
  
  Product.findById(updatedProdId)
  .then((product) => {
    if (product && product.userId.toString() !== req.user._id.toString()) {
      // not allowed to edit products that don't belong to the user
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDescription;
    product.price = updatedPrice;
    return product.save().then((result) => {
      console.log('Updated Product');
      console.log(result);
      res.redirect('/admin/products');
    });
  })
  .catch(err => console.log(err));
};

exports.postDeleteProducts = (req, res, next) => {
  const prodIdToDelete = req.body.productId;
  console.log(prodIdToDelete);
  // add protection - delete only products that belong to the user
  //Product.findByIdAndDelete(prodIdToDelete)
  Product.deleteOne({ _id: prodIdToDelete, userId: req.user._id })
    .then(() => {
      console.log('deleted');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
  
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
    }).catch(err => console.log(err));

}