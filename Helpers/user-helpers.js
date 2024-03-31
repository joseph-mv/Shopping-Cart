db = require('../config/connection')
const promise = require('promise')
const bcrypt = require('bcrypt');
const collection = require("../config/collection");
const { response } = require('express');


module.exports = {
    signUp: (user) => {
        return new promise(async (resolve, reject) => {
            oldUser = await db.get().collection(collection.User_Collection).findOne({ email: user.email })
            if (oldUser) {
                console.log('already user')
                resolve({ status: false })
            }
            else {
                const saltRounds = 10;
                user.password = await bcrypt.hash(user.password, saltRounds)
                user.confirm_password = await bcrypt.hash(user.confirm_password, saltRounds)

                db.get().collection(collection.User_Collection).insertOne(user).then((data) => {
                    console.log(data)
                    resolve({ data, status: true })
                })
            }
        })
    },
    login: (user) => {

        return new promise(async (resolve, reject) => {
            existingUser = await db.get().collection(collection.User_Collection).findOne({ email: user.email })
            if (existingUser) {
                if (await bcrypt.compare(user.password, existingUser.password)) {
                    console.log('user logedin')
                    // console.log(existingUser)
                    resolve({ status: true, userName: existingUser.name, userId: existingUser._id })
                }
                else {
                    resolve({ status: false })
                }
            }
            else {
                resolve({ status: false })
            }
        })

    },
    addToCart:  (productId, userId) =>{
return new promise(async (resolve, reject) =>  {
        
    cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
      if (cart) {
          product = await db.get().collection(collection.Cart_Collection).updateOne({ 'products.productId': { $eq: productId } }, {
              
              $inc: {
                  'products.$.quantity': 1
              }
          })
          console.log(product)
      if (product.modifiedCount==0) {
          db.get().collection(collection.Cart_Collection).updateOne({ userId: userId }, {
              $push: {
                  products: {
                      productId: productId,
                      quantity: 1
                  }
              }
          }).then((response)=>{
              console.log(response)
          })
      }
          }

      else {
          // console.log(productId)
          cart = {
              userId: userId,
              products: [{
                  productId: productId,
                  quantity: 1
              }]
          }
          db.get().collection(collection.Cart_Collection).insertOne(cart).then((responce) => {
              console.log(responce)
              console.log('new cart')
          })
      }
 resolve()
  })
    },
    cartCount: async (userId) => {
        return new promise(async (resolve, reject) => {
            db.get().collection(collection.Cart_Collection).aggregate(
                [
                    {
                        $match: { userId: userId }
                    },
                    {
                       $unwind:'$products'
                    },{
                        $group:{ _id:null, quantity:{$sum:'$products.quantity'}}
                    }
                     ]
            ).toArray().then((responce)=>{
                resolve(responce[0])
            })
        })
         
        
    }
}