
const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();


// /admin/add-product => GET
router.get('/add-product', adminController.getAddProducts 
);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', adminController.getEditProducts 
);

// /admin/edit-product => POST
router.post('/edit-product', adminController.postEditProducts 
);

// /admin/delete-product => POST
router.post('/delete-product', adminController.postDeleteProducts)

// /admin/products => GET
router.get('/products', adminController.getProducts);

module.exports = router;

