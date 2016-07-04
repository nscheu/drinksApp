var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://localhost/cs4550');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;


//var WebsiteSchema = new mongoose.Schema({
//  name: String,
//  url: String,
//  created: { type: Date, "default": Date.now() }
//});

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  roles: [String],
  bookshelf: { type: Array, "default": new Array() }
});


//var Website = mongoose.model('Website', WebsiteSchema);
var UserModel = mongoose.model('UserModel', UserSchema);


//var admin = new UserModel({ username: 'alice', password: 'alice', roles: ["admin"] });
//var student = new UserModel({ username: 'bob', password: 'bob', bookshelf: ["student"] });

//admin.save();
//student.save();

//UserModel.remove({ _id: "5532f2321c87e71853543a7a" }, function (data) {
//});

//var website1 = new Website({
//  name: "Website 1",
//  url: "www.website1.com"
//});

//var website2 = new Website({
//  name: "Website 2",
//  url: "www.website2.com"
//});

//website1.save();

//Website.find(function (err, docs) {
//  console.log(docs);
//});


//Website.find({name: 'Website 1'}, function (err, docs) {
//    console.log(docs);
//});

//Website.findById("55326aeaab06fe5c4a25c81e", function(err, doc) {
//      console.log(doc);
//});


//Website.remove({ _id: "55326aeaab06fe5c4a25c81e" }, function (data) {
//});


//Website.find(function (err, docs) {
//  console.log(docs);
//});

//Website.findById("55326b7aafae43c447235303", function (err, doc) {
//  console.log("FindbyID");
//  console.log(doc);
//  doc.name = "Website 222";
//  doc.save();
//});



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));// GET /style.css etc

//var users = [
//  { username: 'alice', password: 'a', firstName: 'Alice', lastName: 'Wonderland', roles: ['admin', 'student', 'instructor'] },
//  { username: 'bob', password: 'a', firstName: 'Bob', lastName: 'Marley', roles: ['student']}
//];

passport.use(new LocalStrategy(
  function (username, password, done) {
    //for (var u in users) {
    //  if (username == users[u].username && password == users[u].password) {
    //    return done(null, users[u]);
    //  }
    //}
    //return done(null, false, { message: 'Unable to login' });

    //CALL TO DATABASE AND VERIFY THAT USERNAME/PASSWORD MATCH A VALUE
    UserModel.findOne({username: username, password: password}, function (err, user) {
      //console.log(docs);
      if (user) {
        return done(null, user);
      }
      return done(null, false, { message: 'Unable to login' });
    });
    
  }));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

var auth = function (req, res, next) {
  if (!req.isAuthenticated())
    res.send(401);
  else
    next();
};

app.get('/hello', function (req, res) {
  res.send('hello world');
});

app.get('/loggedin', function (req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});

app.get('/rest/user', auth, function (req, res) {
  UserModel.find(function (err, users) {
    res.json(users);
  });
});



app.post('/login', passport.authenticate('local'), function (req, res) {
  console.log(req.user);
  res.send(req.user);
});

app.post('/register', function (req, res) {
  UserModel.findOne({ username: req.body.username }, function (err, user) {
    if (user) {
      res.send(200);
    }
    else {
      var newUser = new UserModel(req.body);
      newUser.roles = ['student'];

      newUser.save(function (err, user) {
        req.login(user, function (err) {
          if (err) { return next(err); }
          res.json(user);
        });        
      });

    }
  });
  var newUser = req.body;
  console.log(newUser);
});

app.post('/saveFavoritesToProfile', function (req, res) {
  //console.log("SAVE FAVES-user");
  //console.log(req.user.username);
  //console.log("SAVE FAVES-faves");
  //console.log(req.body);
  console.log("SAVE FAVES3");
  UserModel.findOne({ username: req.user }, function (err, user) {
    if (user) {
      var modUser = new UserModel(req.user);
      modUser.update({ username: req.user.username }, { bookshelf: req.body });
      //modUser.save(function (err, docs) {
      //  console.log(docs);
      //});
    }
    else {
      res.send(401);
    }
  });
  //console.log(req);
});


app.post('/logout', function (req, res) {
  req.logOut();
  res.send(200);
});

app.get('/process', function (req, res) {
  res.json(process.env);
});

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;

app.listen(port, ip);