
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');


const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
var ObjectId = require('mongodb').ObjectID;

const config = require('./config');
const fs = require('fs');
const mongoDB = 'mongodb://'+config.mlab.uName+':'+config.mlab.pWord+'@ds157516.mlab.com:57516/'+config.mlab.db;

let db;
let collection;
let EmployeeCollection;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

MongoClient.connect(mongoDB,{useNewUrlParser:true} ,(err, client) => {
  if (err) return console.log(err)
  //db.cowlogs.insert( { item: "card", qty: 15 } )
  db = client.db(config.mlab.db)
  collection = db.collection(config.mlab.collection);
  EmployeeCollection = db.collection(config.mlab.EmployeeCollection);

})

app.listen(config.app.port, () => {
    console.log(' live on ' + config.app.port);
  });

app.post("/UserSignUp", function(req, res) {
  //console.log(req.body['data']);
  var uEmail = req.body.emailSignUpName;
  var user = collection.find({emailSignUpName:uEmail});

  user.count(function(err,result){
        if(result==0){
            collection.insertOne(req.body , function(err, result) {
                if (err) return console.log(err)
                res.send(result)
            });
        }else{
            res.send(err);
        }
  });
  
});

app.post("/signIn", function(req, res) {
  //console.log(req.body['data']);
  var uEmail = req.body.emailSignInName;
  var uPassword = req.body.passwordSignInName;
  var user = collection.find({emailSignUpName:uEmail,passwordSignUpName:uPassword});

  user.count(function(err,result){
        if(result==1){
            user.toArray(function(err,result){
                if(err) throw err;
                 res.send(result);
              });
        }else{
            res.send(err);
        }
  });

});

app.post("/saveToBuy", function(req, res) {

    EmployeeCollection.insertOne(req.body , function(err, result) {
       if (err) return console.log(err)
       res.send(result)
    });

});

app.get('/getToBuy/:id', function (req, res) {
    //console.log(req.params.id);
  var query= req.params.id;
  EmployeeCollection.find({"user":query,"archive":"false"}).toArray(function(err,result){
    if(err) throw err;
    //console.log(result);
     res.send(result);
  });

 
});

app.get('/purchased/:id', function (req, res) {
   console.log(req.params.id);
  var query= req.params.id;
  EmployeeCollection.updateOne({ _id:ObjectId(query)},{$set:{"archive":"true"}},function(err, result) {
     if (err) return console.log(err)
     res.send(result)
  });


});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.render('contact');
});


app.post("/sendto", (req, res) => {


  //  var roster= req.body.roster;

   // console.log(roster);


    var Email= req.body.Email;

    console.log(Email);

    const output = `
    <p>We are happy to work with you!</p>
    <h3>Message</h3>
    <ul>  
      <li>Time/Date: ${req.body.roster}</li>
      <li>Description: ${req.body.desc}</li>
    </ul>
    
  `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'milanudayanga64126412@gmail.com', // generated ethereal user
            pass: 'barnbuddy123'  // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Rosters" <milanudayanga64126412@gmail.com>', // sender address
        to: Email, // list of receivers
        subject: 'Roster Request', // Subject line
        text: 'Hello world?', // plain text body
        html: output  // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
           // return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);

        res.send("done");
    });
});


