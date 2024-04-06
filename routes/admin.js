var express = require('express');
var router = express.Router();

var productHelper=require('../Helpers/product-helpers')
var express = require('express');
var path = require('path');

verifyAdmin=function() {
  return function(req, res,next){
    // console.log(req.session)
    if(req.session.adminId){
      // console.log(req.session.adminId)
      next()
    }
    else{
      res.redirect('/admin')
    }
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admin/login',{admin:true})
 
});
router.post("/login" , function(req, res, next) {
  console.log('admin page')
  productHelper.login(req.body).then((response)=>{
    if(response.status==true){
      req.session.adminId=req.body.adminId;
      req.session.adminLoggedIn=true
      console.log(req.session)
     res.redirect("/admin/view-products")
      
    }
    else{
      console.log('invalid')
      req.session.adminLoggedErr='Invalid Admin Id or Password'
      res.render('admin/login',{admin:true,loggedErr:req.session.adminLoggedErr})
 
    }
  })
})
router.get('/view-products',verifyAdmin(),(req,res)=>{
  productHelper.productList().then((products)=>{
      
    res.render('admin/view-products',{admin:true,products,adminId:req.session.adminId})
  })
})
router.get('/logout',(req,res)=>{
  req.session.adminId=null;
  req.session.adminLoggedIn=false;
  res.redirect('/admin')

})
router.get('/add-product',verifyAdmin(), (req,res)=>{
console.log(req.session)
  res.render('admin/add-product',{admin:true,adminId:req.session.adminId})
})

router.post('/add-product' ,(req,res)=>{


console.log(req.body)
console.log(req.files)
productHelper.addProduct(req.body,((proId)=>{
  
  
  req.files.image.mv(path.join(__dirname,'../public/images/'+proId+'.jpg'))
  res.redirect('/admin/add-product')

}))



} )
router.get("/edit-products",verifyAdmin(),(req,res)=>{
  // console.log(req.params.products)
  
 let proId=req.query.proId
  
  productHelper.getProductDetails(proId).then((product)=>{
    res.render("admin/edit-product",{admin:true,adminId:req.session.adminId,product})
  })
})
router.post("/edit-product",verifyAdmin(),(req,res)=>{
  console.log(req.body)
  console.log(req.files)
  // let proId=req.body.proId
  productHelper.editProduct(req.body).then(()=>{
    if(req.files){
      req.files.image.mv(path.join(__dirname,'../public/images/'+req.body.proId+'.jpg'))
    }
    
    res.redirect('/admin/view-products')
  
  })
 
})
router.post("/delete-product",verifyAdmin(),(req,res)=>{
console.log(req.body.productId)
productHelper.deleteProduct(req.body.productId).then((response)=>{
  res.json(response)
})

})


module.exports = router;
