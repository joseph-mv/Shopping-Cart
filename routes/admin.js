var express = require('express');
var router = express.Router();

var productHelper=require('../Helpers/product-helpers')
var express = require('express');
var path = require('path');
var userHelper = require('../Helpers/user-helpers');
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

router.get("/users",verifyAdmin(),(req,res)=>{
  productHelper.getUsers().then((users)=>{
    console.log(users)
    res.render('admin/users',{admin:true,adminId:req.session.adminId,users})
  })
})
router.get("/userOrders:id",verifyAdmin(),(req,res)=>{
  userId=req.params.id
  userHelper.orderList(userId).then((orders)=>{
    console.log(orders)
    res.render('admin/orders',{admin:true,adminId:req.session.adminId,orders})
  })
})
router.get("/show-products",verifyAdmin(),(req,res)=>{
  orderId=req.query.id
  orderStatus=req.query.status
  if(orderStatus=='placed'){placed=true}
  else{placed=false}
  
  userHelper.orderedProducts(orderId).then((products)=>{
    console.log(products)
    res.render('admin/show-products',{admin:true,adminId:req.session.adminId,products,placed})
  })
})
router.get('/allOrders',verifyAdmin(),(req,res)=>{
  
  productHelper.allOrders().then((orders)=>{
    console.log(orders)
    res.render('admin/orders',{admin:true,adminId:req.session.adminId,orders})
  })

})

router.post("/shipping",verifyAdmin(),(req,res)=>{
  console.log(req.body)
  productHelper.statusShipping(req.body).then((data)=>{
    console.log(data)
    res.json(data)
  })
})

router.post("/deliver",verifyAdmin(),(req,res)=>{
  console.log(req.body)
  productHelper.statusDeliver(req.body).then((data)=>{
    console.log(data)
    res.json(data)
  })
})

module.exports = router;
