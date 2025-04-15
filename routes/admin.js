
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProducts 
);

// /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProducts 
);

// /admin/edit-product => POST
router.post('/edit-product', isAuth, adminController.postEditProducts 
);

// /admin/delete-product => POST
router.post('/delete-product', isAuth, adminController.postDeleteProducts)

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

module.exports = router;

