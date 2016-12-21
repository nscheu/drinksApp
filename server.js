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

console.log("Server Running...");

// SCHEMA ********************************
// User
// Unit
// Component
// Ingredient
// Recipe


// An Ingredient is a user defined ingredient such as orange juice or whisky. 
// Ingredients may be set to public visibility.
var IngredientSchema = new mongoose.Schema({
  //_id: String,
  name: String,
  publick: Boolean,
  creator: String
});

// A Unit is a unit of measurement.
// Units may be set to public visibility.
var UnitSchema = new mongoose.Schema({
  //_id: String,
  name: String,
  shorthand: String,
  conversionParent: String,
  conversionParentFactor: Number,
  publick: Boolean,
  creator: String,
});

// A Component is a user defined ingredient such as orange juice or whisky tied to a quantity.
var ComponentSchema = new mongoose.Schema({
  //_id: String,
  name: String,
  ingredient: IngredientSchema,
  unit: UnitSchema,
  quantity: Number,
  creator: String
});

var RecipeSchema = new mongoose.Schema({
  //_id: String,
  name: String,
  publick: Boolean,
  creator: String,
  component_list: [ComponentSchema],
});




var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  user_id: String,
  user_first_name: String,
  user_last_name: String,
  recipe_list: [RecipeSchema],
  my_bar_list: [ComponentSchema]
});






//


// DEFINE MONGOOSE MODELS
var UserModel = mongoose.model('UserModel', UserSchema);
var UnitModel = mongoose.model('UnitModel', UnitSchema);
var ComponentModel = mongoose.model('ComponentModel', ComponentSchema);
var IngredientModel = mongoose.model('IngredientModel', IngredientSchema);
var RecipeModel = mongoose.model('RecipeModel', RecipeSchema);

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
// CREATE USER
app.post('/createUser', function (req, res) {
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

// READ USER
app.get('/readUser', auth, function (req, res) {
  UserModel.find(function (err, user) {
    res.json(user);
  });
});


// UPDATE USER
app.post("/updateUser", auth, function (req, res) {
  console.log("Server - updateUser REST");
  UserModel.findOneAndUpdate({ _id: req.body._id }, function (err, user) {
    if (err) throw err;
    // we have the updated user returned to us
    res.json(user);
  });
});

// DELETE USER
app.post('/deleteUser', auth, function (req, res) {
  //console.log("server - delUser REST");
  UserModel.remove({ _id: req.body._id }, function (err, users) {
    res.json(users);
  });
});





// Unit
// API Unit CRUD *************************************************************
// CREATE Unit
app.post('/createUnit', function (req, res) {
  console.log('createUnit');
  ItemModel.findOne({ item_name: req.body.item_name }, function (err, unit) {
    if (unit) {
      res.send(200);
    }
    else {
      var newUnit = new UnitModel(req.body);
      newUnit.save(function (err, unit) {
          if (err) { return next(err); }
          res.json(unit);
      }); 
    }
  });
});

// READ Unit
app.post('/readUnit', auth, function (req, res) {
  UnitModel.find(function (err, unit) {
    res.json(unit);
  });
});

// UPDATE Unit
app.post("/updateUnit", auth, function (req, res) {
  console.log("server - updateUnit REST");
  //console.log(req.body._id);
  //var objId = "ObjectId(" + req.body._id + ")";
  var query = {"_id": req.body._id};
  UnitModel.findOneAndUpdate(query, req.body, {upsert: false}, function (err, unit) {
    if (err) throw err;
    // we have the updated unit returned to us
    res.json(unit);
  });
});

// DELETE Unit
app.post('/deleteUnit', auth, function (req, res) {
  //console.log("server - delItem REST");
  UnitModel.remove({ _id: req.body._id }, function (err, unit) {
    console.log(unit)
    res.json(unit);
  });
});


// READ Unit list
app.post('/rest/recipe_list', auth, function (req, res) {
  RecipeModel.find({ creator: req.body.user_id }, function (err, recipe_list) {
    res.json(recipe_list);
  });
});





// Component
// API Component CRUD *************************************************************
// Create Component
app.post('/createComponent', function (req, res) {
  console.log('createComponent');
  ComponentModel.findOne({ _id: req.body._id }, function (err, component) {
    if (component) {
      res.send(200);
    }
    else {
      var newComponent = new ComponentModel(req.body);
      newComponent.save(function (err, component) {
          if (err) { return next(err); }
          res.json(component);
      }); 
    }
  });
});
// Read Component
app.get('/readComponent', auth, function (req, res) {
  ComponentModel.find(function (err, component) {
    res.json(component);
  });
});
// Update Component
//  TODO:: Implement
// Delete Component
app.post('/deleteComponent', auth, function (req, res) {
  //console.log("server - Delete Component REST");
  ComponentModel.remove({ _id: req.body._id }, function (err, component) {
    res.json(component);
  });
});

// Ingredient
// API Ingredient CRUD *************************************************************
// Create Ingredient
app.post('/createIngredient', function (req, res) {
  console.log('createIngredient');
  IngredientModel.findOne({ _id: req.body._id }, function (err, ingredient) {
    if (ingredient) {
      res.send(200);
    }
    else {
      var newIngredient = new IngredientModel(req.body);
      newIngredient.save(function (err, ingredient) {
          if (err) { return next(err); }
          res.json(ingredient);
      }); 
    }
  });
});
// Read Ingredient
app.get('/readIngredient', auth, function (req, res) {
  UserModel.find(function (err, ingredient) {
    res.json(ingredient);
  });
});
// Update Ingredient
//  TODO:: Implement
// Delete Ingredient
app.post('/deleteIngredient', auth, function (req, res) {
  //console.log("server - delete Ingredient REST");
  ComponentModel.remove({ _id: req.body._id }, function (err, ingredient) {
    res.json(ingredient);
  });
});

// Recipe
// API Recipe CRUD *************************************************************
// Create Recipe
app.post('/createRecipe', function (req, res) {
  console.log('createRecipe');
  RecipeModel.findOne({ _id: req.body._id }, function (err, recipe) {
    if (recipe) {
      res.send(200);
    }
    else {
      var newRecipe = new RecipeModel(req.body);
      newRecipe.save(function (err, recipe) {
          if (err) { return next(err); }
          res.json(recipe);
      }); 
    }
  });
});
// Read Recipe
app.get('/readRecipe', auth, function (req, res) {
  UserModel.find(function (err, recipe) {
    res.json(recipe);
  });
});
// Update Recipe
// TODO:: Implement
// Delete Recipe
app.post('/deleteRecipe', auth, function (req, res) {
  //console.log("server - delete Recipe REST");
  RecipeModel.remove({ _id: req.body._id }, function (err, recipe) {
    res.json(recipe);
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
