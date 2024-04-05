db = require('../config/connection')
const promise = require('promise')
const collection = require('../config/collection')
const bcrypt = require('bcrypt');
module.exports = {

    login:(admin)=>{
        return new promise((resolve, reject) => {
            db.get().collection(collection.Admin_Collection).findOne({ adminId: admin.adminId })
               .then((data) => {
                console.log(data)
                    if (data) {
                        bcrypt.compare(admin.password, data.password).then((result) => {
                            if (result) {
                                console.log('admin logedin')
                                resolve({ status: true })
                            }
                            else {
                                console.log("error")
                                resolve({ status: false })
                            }
                        })
                    }
                    else {
                        console.log("error2")
                        resolve({ status: false })
                    }
                })
               .catch((err) => {
                    reject(err)
                })
        })
    },
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