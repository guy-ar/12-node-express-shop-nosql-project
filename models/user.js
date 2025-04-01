class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    save() {
        const db = getDb();
        return db
            .collection('users')
            .insertOne(this)
            .then((result) => console.log('User inserted'))
            .catch((err) => console.log(err));
    }

    static findById(id) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: mongodb.ObjectId.createFromHexString(id) })
            .then((user) => user)
            .catch((err) => console.log(err));
    }

}

module.exports = User; 