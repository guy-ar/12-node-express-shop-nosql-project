const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
    ***REMOVED***
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


