var express = require('express');
var bcrypt = require('bcryptjs'); 
var path = require('path');
var app = express();
var alert= require('alert');
const popup = require('node-popup');
const PORT = process.env.PORT || 4000;

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//mongoDB connection
var db;
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const databaseName = "myDB";
MongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    return console.log("Connection failed");
  }
  console.log("Connection established");
  db = client.db(databaseName);
});
//session 
var session= require('express-session');
const { MemoryStore } = require('express-session');
var MongoDBSession=require('connect-mongodb-session')(session);
var mongoURI= "mongodb://localhost:27017/myDB";

var store =new MongoDBSession({
   uri: mongoURI,
   collection: 'myCollection'
}); 

app.use(session({
   secret: 'secret',
   resave:false,
   saveUninitialized: false,
   cookie: {expires:(3 * 86400 * 1000)},
   store:store
 })
);


const isAuth=(req,res,next)=>{
  session=req.session;
  if(session.username){
    next();
  }else{
    res.redirect('/');}
}

 //registeration

 app.post('/register',async(req,res)=>{
  var username =req.body.username;
  var password =req.body.password;
  if(username.length!=0 &&password.length!=0 ){
  var user=await db.collection("myCollection").findOne({username});
  if(user){
    alert("username already exist");
     return res.redirect('registration');
  }else{
    const hashedPsw = await bcrypt.hash(password, 12);
    db.collection("myCollection").insertOne({username:username ,password:hashedPsw,wantToGo:[]});
    res.redirect('/'); 
  }}else{
    alert("please enter username and password");
    res.redirect('registration');
  }
 });
 
//login

app.post('/',async(req,res)=>{
  var username =req.body.username;
  var password =req.body.password;
  if(username=="admin"){
    if(password=="admin"){
      session=req.session;
      session.username=req.body.username;
      res.render('home');
    }else{
      alert("wrong password");
      res.redirect('/');
    }
  }else{
  var user=await db.collection("myCollection").findOne({username});
  if(!user){
    alert("username not found");
    return res.redirect('/');
  }else{
    var passMatch= await bcrypt.compare(password,user.password);
    if(!passMatch){
      alert("wrong password");
      return res.redirect('/');
    }else{
      session=req.session;
      session.username=req.body.username;
      res.render('home');
    }
  }
}
});

//routes

app.get('/',function(req,res){
  session=req.session;
  if(session.username){
    res.render('home');
  }else{
 res.render('login');}
});

app.get('/registration',function(req,res){
  if(session.username){
    res.render('home');
  }else{
 res.render('registration');}
 });

 app.get('/home',isAuth, (req, res) => {
  res.render('home');
});

app.get('/hiking',isAuth, (req, res) => {
  res.render('hiking');
});

app.get('/cities',isAuth, (req, res) => {
  res.render('cities');
});

app.get('/islands',isAuth, (req, res) => {
  res.render('islands');
});

app.get('/wanttogo',isAuth, async (req, res) => {
  var user=await db.collection("myCollection").findOne({username: req.session.username});
  var countries=user.wantToGo;
  res.render('wanttogo',{countries});
});

app.get('/inca',isAuth, (req, res) => {
  res.render('inca');
});

app.get('/annapurna',isAuth, (req, res) => {
  res.render('annapurna');
});

app.get('/paris',isAuth, (req, res) => {
  res.render('paris');
});

app.get('/rome',isAuth, (req, res) => {
  res.render('rome');
});

app.get('/bali',isAuth, (req, res) => {
  res.render('bali');
});

app.get('/santorini',isAuth, (req, res) => {
  res.render('santorini');
});

app.post('/search',isAuth, (req, res) => {
  var countries=["bali","annapurna","inca","paris","rome","santorini"];
  var substring=req.body.Search;
  var results=[];
  if(substring.length>0){
    countries.find(element => {
      if (element.toLowerCase().includes(substring.toLowerCase())) {
        results.push(element);
      }
    });
  }
  res.render('searchresults',{results});
});

app.get('/add',isAuth, async (req, res) => {
 var country=req.url.split("?").pop();
 var user=await db.collection("myCollection").findOne({username: req.session.username});
 var countries=user.wantToGo;
 if(countries.includes(country)){
 alert("added before");
 }else{
  db.collection("myCollection").updateOne({username: req.session.username},{$push: { wantToGo: country }});
  alert("added");
 }
  res.redirect(country);
});

app.get('/res',isAuth,(req,res)=>{
  var country=req.url.split("?").pop();
  res.redirect(country);
});

app.get('/search',isAuth, (req, res) => {
  res.render('searchresults');
});

//logout

app.get('/logout',(req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
