db = require('../config/connection')
const promise = require('promise')
const bcrypt = require('bcrypt');
const collection = require("../config/collection");
const { response } = require('express');
const { ObjectId } = require('mongodb');


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
        console.log('add to cart')
return new promise(async (resolve, reject) =>  {
       
    cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
      if (cart) {
          product = await db.get().collection(collection.Cart_Collection).updateOne({ userId: userId ,'products.productId': { $eq:new ObjectId(productId)  } }, {
              
              $inc: {
                  'products.$.quantity': 1
              }
          })
          console.log(product)
      if (product.modifiedCount==0) {
          await db.get().collection(collection.Cart_Collection).updateOne({ userId: userId }, {
              $push: {
                  products: {
                      productId: new ObjectId(productId),
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
                  productId:new ObjectId(productId),
                  quantity: 1
              }]
          }
         await db.get().collection(collection.Cart_Collection).insertOne(cart).then((responce) => {
              console.log(responce)
              console.log('new cart')
          })
      }
    resolve()
  })
    },
    cartCount: async (userId) => {
        return new promise(async (resolve, reject) => {
            cart= await db.get().collection(collection.Cart_Collection).findOne({userId:userId})
            if(cart){
                // console.log('######')
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
                    console.log("$$$$$")
                    console.log(responce)
                    resolve(responce[0])
                })
            }
            else{
resolve(0)
            }
           
        })
         
        
    },
    productList:(userId)=>{
        console.log(userId)
        return new promise(async (resolve, reject) => {
            db.get().collection(collection.Cart_Collection).aggregate(
                [
                    {
                        $match: { userId: userId }
                    },
                    {
                       $unwind:'$products'
                    },{
                        $lookup: {
                            from: "Products",
                            localField:  "products.productId" , 
                               foreignField: "_id", 
                             as: "productDetails" 
                          }
                    },
                    {
                        $project:{
                            productDetails:  { $arrayElemAt: ["$productDetails", 0] },
                            products:1,
                        }
                    },
                    {
                        $addFields: {
                          price: { $toInt: "$productDetails.price" } // Convert field1 from string to integer
                        }
                      },
                    {
                        $project: {
                            total: { $multiply: ["$price", "$products.quantity"] },
                            productDetails:1,
                            products:1,
                          
                        }  
                    }
                   
                     ]
            ).toArray().then((responce)=>{
                // console.log(responce)
                
                resolve(responce)
            })
        })
    },
    changeQuantity:(userId,productId,amount)=>{
        console.log(userId,productId,amount)
        // cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
      return new promise((resolve,reject)=>{
        db.get().collection(collection.Cart_Collection).updateOne({userId: userId , 'products.productId': { $eq:new ObjectId(productId)  } }, {
              
            $inc: {
                'products.$.quantity': parseInt(amount)
            }
        }).then((responce)=>{
            // console.log(responce)
            resolve(responce)
        })
        

      })
        
     
          

    },
    removeProduct:(productId,userId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collection.Cart_Collection).updateOne(
                {userId: userId  },
                { $pull: { products: { productId:new ObjectId(productId)  } } },
            ).then((response)=>{
                db.get().collection(collection.Cart_Collection).findOne({userId:userId}).then((cart)=>{
                    if(cart.products.length===0){
                        db.get().collection(collection.Cart_Collection).deleteOne({userId:userId}).then((responce)=>{
                            resolve(responce)
                        })
                    }
                })
                console.log(response)
                resolve(response)
            })
        })
    },
    totalAmount:(userId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collection.Cart_Collection).aggregate([
                {
                    $match:{userId:userId}
                },
                {
                    $unwind:'$products'
                }
                ,{
                    $lookup: {
                        from: "Products",
                        localField:  "products.productId" , 
                           foreignField: "_id", 
                         as: "productDetails" 
                      }
                },
                {
                    $project:{
                        productDetails:  { $arrayElemAt: ["$productDetails", 0] },
                        products:1,
                    }
                },
                {
                    $addFields: {
                      price: { $toInt: "$productDetails.price" } // Convert field1 from string to integer
                    }
                  },
                  {
                    $group:
                      {
                        _id: null,
                        totalAmount: { $sum: { $multiply: [ "$price", "$products.quantity" ] } },
                       
                      }
                  }

            ]).toArray().then((products)=>{
                resolve(products[0].totalAmount)
            })
        })
    }
}