// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
// class Product {
//   constructor(title, imageUrl, description, price, id, createdByUserId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//     this._id = id ? mongodb.ObjectId.createFromHexString(id) : null;
//     this.createdByUserId = createdByUserId;
//   }
//   save() {
//     const db = getDb();
//     if (this._id) {
//       return db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this })
//         .then((result) => console.log(result))
//         .catch((err) => console.log(err));
//     } else {
//       return db
//         .collection('products')
//         .insertOne(this)
//         .then((result) => console.log(result))
//         .catch((err) => console.log(err));
//     }
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: mongodb.ObjectId.createFromHexString(id) })
//       .next() // complete the cursor
//       .then((product) => product)
//       .catch((err) => console.log(err));
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .deleteOne({ _id: mongodb.ObjectId.createFromHexString(id) })
//       .then((result) => console.log('item deleted'))
//       .catch((err) => console.log(err));
//   }

//   static fetchAll() { 
//     const db = getDb();
//     return db
//       .collection('products')
//       .find() // get cursor
//       .toArray() // return from cursor all products
//       .then((products) => products)
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = Product;