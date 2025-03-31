const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-shop-sequelize', 'root', '1guymor1', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;

