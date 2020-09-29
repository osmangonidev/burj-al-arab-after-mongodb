const express=require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser=require('body-parser');
const cors=require('cors');
const objectId=require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config();

const app=express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//firebase admit set up 
const serviceAccount = require("./private-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:process.env.FIRE_DB
});


app.get('/',(req,res)=>{
    res.send('<h1>Hello World</h1>')
})

//connect to the mongodb database
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.koqo3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology:true});
client.connect(err => {
    const collection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);

    app.post('/addBooking',(req,res)=>{
        const newBooking=req.body
        res.send('successfully booking')
        collection.insertOne(newBooking)
        .then(result=>console.log(result))
        console.log(req.body)
    })
    
    app.get('/booking',(req,res)=>{
        const bearer=req.headers.authorization;
        const email=req.query.email;

        if(bearer&& bearer.startsWith('Bearer')){
            const idToken=bearer.split(' ')[1];
            console.log(idToken);
            admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
                let tokenEmail = decodedToken.email;
                if(tokenEmail==email){
                    collection.find({email:email})
                    .toArray((err,documents)=>{
                        res.send(documents)
                    })
                }
                else{
                    res.status(401).send('unauthorized access')
                }
            }).catch(function(error) {
                res.status(401).send('unauthorized access')
            });
        }
        else{
            res.status(401).send('unauthorized access')
        }
        
    })
    
});



app.listen(5000,()=>console.log('app running on port:5000'))