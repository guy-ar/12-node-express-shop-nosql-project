
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');
//const applyCsrfProtection = require('../middleware/csrf-protection');

const router = express.Router();


// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProducts 
);

// /admin/add-product => POST
router.post('/add-product', 
    [
        body('title', 'Title must be at least 3 characters long')
            .trim().isLength({min: 3}),
        // body('imageUrl', 'Image URL must be a valid URL')
        //     .trim().isURL(),
        body('price', 'Price must be a number greater than 0')
            .isFloat(),
        body('description', 'Description must be at least 5 characters long')
            .trim().isLength({min: 5, max: 400})  
    ],
    isAuth, adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProducts 
);

// /admin/edit-product => POST
router.post('/edit-product',
    [
        body('title', 'Title must be at least 3 characters long')
            .trim().isLength({min: 3}),
        // body('imageUrl', 'Image URL must be a valid URL')
        //     .trim().isURL(),
        body('price', 'Price must be a number greater than 0')
            .isFloat(),
        body('description', 'Description must be at least 5 characters long')
            .trim().isLength({min: 5, max: 400})
    ],
    isAuth, adminController.postEditProducts 
);

// /admin/delete-product => POST
router.post('/delete-product', isAuth, adminController.postDeleteProducts)
// when we have call from javascript we will use delete http method
router.delete('/product/:productId', isAuth, adminController.deleteProduct)


// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

module.exports = router;

