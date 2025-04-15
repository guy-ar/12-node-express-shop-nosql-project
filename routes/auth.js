const express = require('express');

const router = express.Router();
authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

module.exports = router;
 