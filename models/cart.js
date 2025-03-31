const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    totalPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Cart;