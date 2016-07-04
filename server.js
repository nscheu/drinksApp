var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var db = mongoose.connect(connectionString);

// SCHEMA ********************************

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  user_id: String,
  user_first_name: String,
  user_last_name: String,
  item_list: [String],
  location_list: [String]
});

var ItemSchema = new mongoose.Schema({
  item_id: String,
  item_name: String,
  item_description: String,
  user_id: String
});

var LocationSchema = new mongoose.Schema({
  location_id: String,
  location_name: String,
  location_description: String,
  user_id: String
});

// DEFINE MONGOOSE MODELS
var UserModel = mongoose.model('UserModel', UserSchema);
var ItemModel = mongoose.model('ItemModel', ItemSchema);
var LocationModel = mongoose.model('LocationModel', LocationSchema);

// SET THE MODULES
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));// GET /style.css etc

// PASSPORT FUNCTIONS
passport.use(new LocalStrategy(
  function (username, password, done) {
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



// API USER CRUD *************************************************************
// CREATE
app.post('/create', function (req, res) {
  UserModel.findOne({ username: req.body.username }, function (err, user) {
    if (user) {
      res.send(200);
    }
    else {
      var newUser = new UserModel(req.body);

      newUser.save(function (err, user) {
        req.login(user, function (err) {
          if (err) { return next(err); }
          res.json(user);
        });        
      });
    }
  });
  var newUser = req.body;
});

// READ
app.get('/rest/user', auth, function (req, res) {
  UserModel.find(function (err, user) {
    res.json(user);
  });
});


// UPDATE
app.post("/api/updateUser", auth, function (req, res) {
  console.log("server - updateUser REST");
  //console.log(req.body);
  UserModel.findOneAndUpdate({ _id: req.body._id }, function (err, user) {
    if (err) throw err;
    // we have the updated user returned to us
    res.json(user);
  });
});

// DELETE
app.post('/rest/delUser', auth, function (req, res) {
  //console.log("server - delUser REST");
  UserModel.remove({ _id: req.body._id }, function (err, users) {
    res.json(users);
  });
});



// API ITEM CRUD *************************************************************
// CREATE 
app.post('/createItem', function (req, res) {
  console.log('createItem');
  ItemModel.findOne({ item_name: req.body.item_name }, function (err, item) {
    if (item) {
      res.send(200);
    }
    else {
      var newItem = new ItemModel(req.body);

      newItem.save(function (err, item) {
          if (err) { return next(err); }
          res.json(item);
      }); 
    }
  });
});

// READ
app.post('/rest/item_list', auth, function (req, res) {
  ItemModel.find({ user_id: req.body.user_id }, function (err, item_list) {
    res.json(item_list);
  });
});

// UPDATE
app.post("/rest/updateItem", auth, function (req, res) {
  console.log("server - updateItem REST");
  console.log(req.body._id);
  //var objId = "ObjectId(" + req.body._id + ")";
  var query = {"_id": req.body._id};
  ItemModel.findOneAndUpdate(query, req.body, {upsert: false}, function (err, item) {
    if (err) throw err;
    // we have the updated item returned to us
    res.json(item);
  });
});

// DELETE
app.post('/rest/delItem', auth, function (req, res) {
  //console.log("server - delItem REST");
  ItemModel.remove({ _id: req.body._id }, function (err, items) {
    console.log(items)
    res.json(items);
  });
});

// API LOCATION CRUD *************************************************************
// CREATE 
app.post('/createLocation', function (req, res) {
  console.log('createLocation');
  LocationModel.findOne({ location_name: req.body.location_name }, function (err, location) {
    if (location) {
      res.send(200);
    }
    else {
      var newLocation = new LocationModel(req.body);

      newLocation.save(function (err, location) {
          if (err) { return next(err); }
          res.json(location);
      }); 
    }
  });
});

// READ
app.post('/rest/location_list', auth, function (req, res) {
  LocationModel.find({ user_id: req.body.user_id }, function (err, location_list) {
    res.json(location_list);
  });
});

// UPDATE
app.post("/rest/updateLocation", auth, function (req, res) {
  console.log("server - updateLocation REST");
  console.log(req.body._id);
  var query = {"_id": req.body._id};
  LocationModel.findOneAndUpdate(query, req.body, {upsert: false}, function (err, location) {
    if (err) throw err;
    // we have the updated item returned to us
    res.json(location);
  });
});

// DELETE
app.post('/rest/delLocation', auth, function (req, res) {
  LocationModel.remove({ _id: req.body._id }, function (err, location) {
    //console.log(location);
    res.json(location);
  });
});










// INVENTORY

app.get('/hello', function (req, res) {
  res.send('hello world');
});

// LOGIN MANAGMENT API

app.post('/login', passport.authenticate('local'), function (req, res) {
  console.log(req.user);
  res.send(req.user);
});

app.get('/loggedin', function (req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/logout', function (req, res) {
  req.logOut();
  res.send(200);
});






var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;

app.listen(port, ip);
