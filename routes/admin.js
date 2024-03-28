var express = require('express');
var router = express.Router();

var productHelper=require('../Helpers/product-helpers')
var express = require('express');
var path = require('path');


/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('admin page')
  productHelper.productList().then((products)=>{
    
    res.render('admin/view-products',{admin:true,products})
  })
  
});
router.get('/add-product', (req,res)=>{
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product' ,(req,res)=>{

console.log(req.body)
console.log(req.files)
productHelper.addProduct(req.body,((proId)=>{
  
  
  req.files.image.mv(path.join(__dirname,'../public/images/'+proId+'.jpg'))
  res.redirect('/admin/add-product')

}))



} )


module.exports = router;
