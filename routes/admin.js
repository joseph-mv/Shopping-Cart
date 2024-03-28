var express = require('express');
var router = express.Router();
var db=require('../config/connection')
var productHelper=require('../Helpers/product-helpers')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/view-products',{admin:true})
});
router.get('/add-product', (req,res)=>{
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product' ,(req,res)=>{
console.log(req.body)
productHelper.addProduct(req.body)



} )


module.exports = router;
