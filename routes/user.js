var express = require('express');
var router = express.Router();
var productHelper=require('../Helpers/product-helpers')

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

module.exports = router;
