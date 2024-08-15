const MongoClient = require("mongodb").MongoClient
var state={
    db:null
}
module.exports.connect = async function(done){
    var url = process.env.MONGODB_URI;
  
    dbname='ShoppingCart'
    
   
    await MongoClient.connect(url)
    .then((data) => {
        // Access the newly created database with the desired name
        state.db = data.db(dbname); 

     done()
     
    })
    .catch((error) => {
        console.error("Connection error:", error);
        done(error);
    });
    
 
}

module.exports.get=function(){
   return state.db
     
}




// const { MongoClient, ServerApiVersion } = require('mongodb');
// require('dotenv').config()
// var state={
//         db:null
//     }


// module.exports.connect = async function(done){
    
//      const uri=process.env.mongo_uri
//     const client = new MongoClient(uri, {
//         serverApi: {
//           version: ServerApiVersion.v1,
//           strict: true,
//           deprecationErrors: true,
//         }
//       });
    
//     dbname='ShoppingCart'
   
//     await client.connect()
//     .then((data) => {
//         // Access the newly created database with the desired name
//         state.db = data.db(dbname); 

//      done()
    
     
//     })
//     .catch((error) => {
//         console.error("Connection error:", error);
//         done(error);
//     });
    
 
// }

// module.exports.get=function(){
//    return state.db
     
// }




