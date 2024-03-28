db=require('../config/connection')
module.exports={
    addProduct:(product)=>{
db.get().collection('Products').insertOne(product)
    }
}