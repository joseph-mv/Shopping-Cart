var express = require('express');
var router = express.Router();
var productHelper = require('../Helpers/product-helpers')
var userHelper = require('../Helpers/user-helpers')

verifyLogin=function(){
  return function(req,res,next){
    if(req.session.userLoggedIn){
      next()
    }
    else{
      res.redirect('/login')
    }
  }
}

/* GET home page. */

router.get('/', function (req, res, next) {
  productHelper.productList().then(async (products) => {
    console.log(req.session)
    if(req.session.userLoggedIn){
      count=await userHelper.cartCount(req.session.userId)
      console.log(count.quantity)
      userName=req.session.userName
      
      res.render('user/index', { products,userName,count:count.quantity })
    }
   else{
    
    res.render('user/index', { products})
   }
   
   
    
  })
});
router.get('/login', ((req, res, next) => {
  // console.log(req.session)
  res.render('user/login',{loggedError:req.session.loggedError})
}))

router.get('/signUp', (req, res, next) => {

  res.render('user/signUp')
})

router.post('/signUp', (req, res) => {
  console.log(req.body)
  userHelper.signUp(req.body).then((user) => {
   if (user.status) {
      res.redirect('/login')
    }
    else {
      res.render('user/signUp', { status: 'Oops, that email is already registered.' })
    }
 })
})
router.post('/login',(req, res) => {
  userHelper.login(req.body).then((response) => {
  console.log(response)
    if(response.status){
      req.session.userName=response.userName
      req.session.userLoggedIn=true
      req.session.userId=response.userId
   
      // console.log(req.session)
      res.redirect('/')

    }
    else{
      req.session.loggedError='Invalid Email or Password'
      // console.log(req.session)
      res.redirect('/login')
    }
  })
})
router.get("/logout",(req, res) => {
  req.session.userName=null
      req.session.userLoggedIn=false
      req.session.userId=null
      res.redirect('/login')

})
router.get('/cart',verifyLogin(), (req, res) => {
res.render('user/cart',{userName,count:count.quantity})
})

router.post('/add-to-cart',verifyLogin(),(req,res)=>{
  productId=req.body.productId
userHelper.addToCart(productId,req.session.userId).then(async()=>{
 
await userHelper.cartCount(req.session.userId).then((responce)=>{

count=responce.quantity


res.json(count)
})
 
}
  
)
})



module.exports = router;
