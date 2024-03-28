db = require('../config/connection')
const promise = require('promise')
module.exports = {
    addProduct: (product, callback) => {
        db.get().collection('Products').insertOne(product).then((data) => {
            console.log(data)
            callback(data.insertedId)
        })

    },

    productList: () => {

        return new promise((resolve, reject) => {

            db.get().collection('Products').find().toArray().then((data) => {

                resolve(data)
            })
        })
    }

}