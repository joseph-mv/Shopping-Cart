var express = require('express');
var router = express.Router();
var productHelper=require('../Helpers/product-helpers')
var userHelper = require('../Helpers/user-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelper.productList().then((products)=>{
    res.render('user/index',{products})
  })
});
router.get('/login',((req, res, next) => {
  res.render('user/login')
}))

router.get('/signUp',(req, res, next) => {
  
  console.log('signup')
  res.render('user/signUp')
})

router.post('/signUp',(req,res)=>{
 userHelper.signUp(req.body).then((user)=>{
 
  if(user.status){
    res.redirect('/login')
  }
  else{
    res.render('user/signUp',{status:'Oops, that email is already registered.'})
    
  }
  
 })
}

)

module.exports = router;
