var express = require('express');
var bcrypt = require('bcryptjs'); 
var path = require('path');
var app = express();

//mongoDB connection
var db;
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const databaseName = "MyDB";
MongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    return console.log("Connection failed for some reason");
  }
  console.log("Connection established - All well");
  db = client.db(databaseName);
});
//session 
var session= require('express-session');
var MongoDBSession=require('connect-mongodb-session')(session);
var mongoURI= "mongodb://localhost:27017/MyDB";

var store =new MongoDBSession({
   uri: mongoURI,
   collection: 'session'
}); 

app.use(session({
   secret: 'some secret',
   resave:false,
   saveUninitialized: false,
   store: store 
 })
);

const isAuth=(req,res,next)=>{
  if(req.session.isAuth){
    next();
  }else{
    res.redirect('/');
  }
}

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
 res.render('login')
});
app.get('/registration',function(req,res){
  res.render('registration')
 });
 
 //registeration
 app.post('/register',async(req,res)=>{
  var username =req.body.username;
  var password =req.body.password;
  var user=await db.collection("users").findOne({username});
  if(user){
     return res.redirect('registration');
  }else{
    const hashedPsw = await bcrypt.hash(password, 12);
    db.collection("users").insertOne({username:username ,password:hashedPsw});
    res.redirect('/'); 
  }
 });
 
//login
app.post('/',async(req,res)=>{

  var username =req.body.username;
  var password =req.body.password;
  var user=await db.collection("users").findOne({username});
  if(!user){
    return res.redirect('/');
  }else{
    var passMatch= await bcrypt.compare(password,user.password);
    if(!passMatch){
      return res.redirect('login');
    }else{
      req.session.isAuth = true;
      res.render('home');
    }
  }
});

app.get('/hiking',isAuth, (reg, res) => {
  res.render('hiking');
});
app.get('/cities',isAuth, (reg, res) => {
  res.render('cities');
});
app.get('/islands',isAuth, (reg, res) => {
  res.render('islands');
});
app.get('/wanttogo',isAuth, (reg, res) => {
  res.render('wanttogo');
});
app.get('/inca',isAuth, (reg, res) => {
  res.render('inca');
});
app.get('/annapurna',isAuth, (reg, res) => {
  res.render('annapurna');
});
app.get('/paris',isAuth, (reg, res) => {
  res.render('paris');
});
app.get('/rome',isAuth, (reg, res) => {
  res.render('rome');
});
app.get('/bali',isAuth, (reg, res) => {
  res.render('bali');
});
app.get('/santorini',isAuth, (reg, res) => {
  res.render('santorini');
});


app.listen(4000);