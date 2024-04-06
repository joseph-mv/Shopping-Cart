db = require('../config/connection')
const promise = require('promise')
const collection = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
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
    },
    getProductDetails: (proId) => {
        return new promise((resolve,reject)=>{
            console.log(proId)
            db.get().collection(collection.Product_Collection).findOne({_id:new ObjectId(proId) }).then((data) => {
                
                console.log(data)
                resolve(data)
            })
        })
    },
    editProduct:(product)=>{
        return new promise((resolve,reject)=>{
           
            db.get().collection(collection.Product_Collection).findOneAndUpdate({_id:new ObjectId(product.proId) },{
                $set:{name:product.name,price:product.price,category:product.category,description:product.description}}).then((data) => {
                
                console.log(data)
                resolve(data)
            })
        })
    },
    deleteProduct:(productId)=>{
        return new promise((resolve,reject)=>{
           
            db.get().collection(collection.Product_Collection).findOneAndDelete({_id:new ObjectId(productId) }).then((data) => {
                
                console.log(data)
                resolve(data)
            })
        })
    },
    getUsers:()=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collection.User_Collection).find().toArray().then((data) => {
                
                resolve(data)
            })
        })

    }

}