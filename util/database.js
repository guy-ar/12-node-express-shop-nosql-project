const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://guyNodeShop:tkGQBi2GtnHMYZxU@word-quest-db.jdoj9.mongodb.net/?retryWrites=true&w=majority&appName=shop-db')
    .then(client => {
        console.log('Connected to Database');
        _db = client.db('shop-db');
        callback();
    }).catch(err => {
        console.log(err);
        throw err;
    });
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found';
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


