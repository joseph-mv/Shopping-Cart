db = require('../config/connection')
const promise = require('promise')
const bcrypt = require('bcrypt');
const collection = require("../config/collection");
const { response } = require('express');
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const { resolve } = require('path')


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
    addToCart: (productId, userId) => {
        console.log('add to cart')
        return new promise(async (resolve, reject) => {

            cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
            if (cart) {
                product = await db.get().collection(collection.Cart_Collection).updateOne({ userId: userId, 'products.productId': { $eq: new ObjectId(productId) } }, {

                    $inc: {
                        'products.$.quantity': 1
                    }
                })
                console.log(product)
                if (product.modifiedCount == 0) {
                    await db.get().collection(collection.Cart_Collection).updateOne({ userId: userId }, {
                        $push: {
                            products: {
                                productId: new ObjectId(productId),
                                quantity: 1
                            }
                        }
                    }).then((response) => {
                        console.log(response)
                    })
                }
            }

            else {
                // console.log(productId)
                cart = {
                    userId: userId,
                    products: [{
                        productId: new ObjectId(productId),
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
            cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
            if (cart) {
                // console.log('######')
                db.get().collection(collection.Cart_Collection).aggregate(
                    [
                        {
                            $match: { userId: userId }
                        },
                        {
                            $unwind: '$products'
                        }, {
                            $group: { _id: null, quantity: { $sum: '$products.quantity' } }
                        }
                    ]
                ).toArray().then((responce) => {
                    console.log("$$$$$")
                    console.log(responce)
                    resolve(responce[0])
                })
            }
            else {
                resolve(0)
            }

        })


    },
    productList: (userId) => {
        console.log(userId)
        return new promise(async (resolve, reject) => {
            db.get().collection(collection.Cart_Collection).aggregate(
                [
                    {
                        $match: { userId: userId }
                    },
                    {
                        $unwind: '$products'
                    }, {
                        $lookup: {
                            from: "Products",
                            localField: "products.productId",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    {
                        $project: {
                            productDetails: { $arrayElemAt: ["$productDetails", 0] },
                            products: 1,
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
                            productDetails: 1,
                            products: 1,

                        }
                    }

                ]
            ).toArray().then((responce) => {
                // console.log(responce)

                resolve(responce)
            })
        })
    },
    changeQuantity: (userId, productId, amount) => {
        console.log(userId, productId, amount)
        // cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
        return new promise((resolve, reject) => {
            db.get().collection(collection.Cart_Collection).updateOne({ userId: userId, 'products.productId': { $eq: new ObjectId(productId) } }, {

                $inc: {
                    'products.$.quantity': parseInt(amount)
                }
            }).then((responce) => {
                // console.log(responce)
                resolve(responce)
            })


        })




    },
    removeProduct: (productId, userId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.Cart_Collection).updateOne(
                { userId: userId },
                { $pull: { products: { productId: new ObjectId(productId) } } },
            ).then((response) => {
                db.get().collection(collection.Cart_Collection).findOne({ userId: userId }).then((cart) => {
                    if (cart.products.length === 0) {
                        db.get().collection(collection.Cart_Collection).deleteOne({ userId: userId }).then((responce) => {
                            resolve(responce)
                        })
                    }
                })
                console.log(response)
                resolve(response)
            })
        })
    },
    totalAmount: (userId) => {

        return new promise(async (resolve, reject) => {
            cart = await db.get().collection(collection.Cart_Collection).findOne({ userId: userId })
            if (cart) {
                db.get().collection(collection.Cart_Collection).aggregate([
                    {
                        $match: { userId: userId }
                    },
                    {
                        $unwind: '$products'
                    }
                    , {
                        $lookup: {
                            from: "Products",
                            localField: "products.productId",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    {
                        $project: {
                            productDetails: { $arrayElemAt: ["$productDetails", 0] },
                            products: 1,
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
                            totalAmount: { $sum: { $multiply: ["$price", "$products.quantity"] } },

                        }
                    }

                ]).toArray().then((products) => {
                    resolve(products[0].totalAmount)
                })
            }
            else {
                resolve(null)
            }
        })
    },
    makeOrders: (userId, orderDetails, amount) => {
        return new promise(async (resolve, reject) => {
            console.log(orderDetails)
            orders = {
                userId: userId,
                Date: new Date(),
                orderDetails: orderDetails,
                products: await db.get().collection(collection.Cart_Collection).findOne({ userId: userId }),
                totalAmount: amount,
            }
            if (orderDetails.paymentMethod == 'cod') {
                orders.status = 'placed'
                db.get().collection(collection.Cart_Collection).deleteOne({ userId: userId })

            }
            else {
                orders.status = 'pending'
            }
            db.get().collection(collection.Orders_Collection).insertOne(orders).then((response) => {
                console.log(response)
                console.log('new order')
                resolve(response)
            })

        })
    },
    orderList: (userId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.Orders_Collection).find({ userId: userId }).toArray().then((response) => {
                resolve(response)
            })
        })
    },
    orderedProducts: (orderId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.Orders_Collection).aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                }, {
                    $unwind: '$products.products'
                }, {
                    $lookup: {
                        from: "Products",
                        localField: "products.products.productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                }, {
                    $project: {
                        productDetails: { $arrayElemAt: ["$productDetails", 0] },
                        quantity: '$products.products.quantity',
                        shipped: '$products.products.shipped',
                        delivered:'$products.products.delivered'
                    }

                }

            ]).toArray().then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    razorpay: (amount,orderId) => {
        return new promise((resolve, reject) => {
           
            var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })

            instance.orders.create({
                amount: amount*100,
                currency: "INR",
                receipt: orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }).then((response)=>{
                console.log(response)
                resolve(response)
                order_id=response.id
            })
        })
    },
    verifyPayment:(res)=>{
        return new promise((resolve,reject)=>{
            var crypto = require('crypto');


        console.log(order_id)
        console.log("verifypayment")
        key_secret= 'NCjKTDMTpdIZ8uSXmEUKBfDp'
        function generateSignature(data, key) {
            const hmac = crypto.createHmac('sha256', key);
            hmac.update(data);
            return hmac.digest('hex');
        }
        
        const orderId = order_id;
        const razorpayPaymentId = res.razorpay_payment_id
        const keySecret =key_secret;
        
        const data = orderId + "|" + razorpayPaymentId;
        const generatedSignature = generateSignature(data, keySecret);
        
        console.log(generatedSignature);
        
  if (generatedSignature== res.razorpay_signature) {
    console.log('payment verified');
    resolve()
  }
        })

    },
    changeOrderStatus:(orderId,userId)=>{
     return new promise((resolve,reject)=>{
        db.get().collection(collection.Orders_Collection).updateOne({_id:new ObjectId(orderId) },{
            $set:{
                status:'placed'
            }
        }).then(()=>{
            db.get().collection(collection.Cart_Collection).deleteOne({ userId: userId })
            resolve()
        })
     })
    },
    userDetails:(orderId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collection.Orders_Collection).findOne({_id:new ObjectId(orderId)}).then((response)=>{
               resolve(response.orderDetails)
              })
        })
     
    }
}