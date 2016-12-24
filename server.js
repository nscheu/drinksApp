var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');
mongoose.Promise = global.Promise;
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var db = mongoose.connect(connectionString);

//var ObjectID = require('mongodb').ObjectID;
//req.body._id = new ObjectID()

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
  unit: Object,
  ingredient_id: String,
  unit_id: String,
  quantity: Number,
  creator: String
});

var RecipeSchema = new mongoose.Schema({
  //_id: String,
  name: String,
  publick: Boolean,
  creator: String,
  component_list: [],
});

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  user_id: String,
  user_first_name: String,
  user_last_name: String,
  //recipe_list: [RecipeSchema],
  //my_bar_list: [ComponentSchema]
});


//Starter Dummy Data
var units = [];


var oz = {
  name: "Ounce",
  shorthand: "Oz",
  conversionParent: "Quart",
  conversionParentFactor: 32,
  publick: true,
  creator: "Default",
};
var cup = {
  name: "Cup",
  shorthand: "cu",
  conversionParent: "Quart",
  conversionParentFactor: 4,
  publick: true,
  creator: "Default",
};
units.push(oz);
units.push(cup);


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

// DELETE Unit
app.post('/deleteUnit', auth, function (req, res) {
  //console.log("server - delItem REST");
  UnitModel.remove({ _id: req.body._id }, function (err, unit) {
    console.log(unit)
    res.json(unit);
  });
});





// READ Public Units list
app.post('/rest/unit_list', function (req, res) {
  UnitModel.find({ publick: true }, function (err, recipe_list) {
    // THIS -> res.json(recipe_list);
    res.json(units);
  });
});

// READ Public Recipe list
app.post('/rest/public_recipe_list', function (req, res) {
  RecipeModel.find({ publick: true }, function (err, recipe_list) {
    res.json(recipe_list);
  });
});

// READ Recipe list
app.post('/rest/recipe_list', auth, function (req, res) {
  RecipeModel.find({ creator: req.body.user_id }, function (err, recipe_list) {
    res.json(recipe_list);
  });
});

// READ Bar list
app.post('/rest/bar_list', auth, function (req, res) {
  IngredientModel.find({ creator: req.body.user_id }, function (err, bar_list) {
    res.json(bar_list);
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
  IngredientModel.find(function (err, ingredient) {
    res.json(ingredient);
  });
});
// Update Ingredient
//  TODO:: Implement
// Delete Ingredient
app.post('/deleteIngredient', auth, function (req, res) {
  //console.log("server - delete Ingredient REST");
  IngredientModel.remove({ _id: req.body._id }, function (err, ingredient) {
    res.json(ingredient);
  });
});


// Create Component
app.post('/createComponentFromList', function (req, res) {
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

// var createComponentFromList = function(componentList){
//   async.forEach(componentList, function(component, callback) { 
//   //The second argument, `callback`, is the "task callback" for a specific `messageId`
//         //When the db has deleted the item it will call the "task callback"
//         //This way async knows which items in the collection have finished
//         //db.delete('messages', component, callback);
//         ComponentModel.findOne({ _id: component._id }, function (err, component) {
//           if (component) {
//             res.send(200);
//           }
//           else {
//             var newComponent = new ComponentModel(component);
//             newComponent.save(function (err, component) {
//               if (err) { return next(err); }
//                 res.json(component);
//             }); 
//           }
//         });
//     }, function(err) {
//         if (err) return next(err);
//         //Tell the user about the great success
//         res.json({
//             success: true,
//             message: componentList.length+' component was saved.'
//         });
//     });
// };



// Recipe
// API Recipe CRUD *************************************************************
// Create Recipe
app.post('/createRecipe', function (req, res) {
  console.log('createRecipe');
  var newRecipe = new RecipeModel(req.body);
  newRecipe.save(function (err, data) {
    if(err){ 
      console.log(err);
      res.json(err);
    }
    else { 
      console.log('Saved : ', data );
      res.json(data);
    }
  });
});


// 
// app.post('/createRecipe', function (req, res, next) {
//   console.log('createRecipe');
//   console.log(req.body);
//   var recipe = req.body.recipe;
//   var componentList = req.body.compList;
//   console.log(recipe);
//   console.log(componentList);
//   var returnResponse = [];
//   RecipeModel.findOne({ _id: req.body._id }, function (err, recipe) {
//     if (recipe) {
//       res.send(200);
//     }
//     else {
//       var newRecipe = new RecipeModel(recipe);
//       newRecipe.save(function (err, recipe) {
//           if (err) { return next(err); }
//           //createComponentFromList(componentList);
//           console.log("RECIPE SAVED SAFELY ::");
//           console.log(recipe);
//           console.log("RR");
//           returnResponse.push(recipe);
//           console.log(returnResponse);
//           async.forEach(componentList, function(component, callback) { 
//           //The second argument, `callback`, is the "task callback" for a specific `messageId`
//                 //When the db has deleted the item it will call the "task callback"
//                 //This way async knows which items in the collection have finished
//                 //db.delete('messages', component, callback);
//                 var newComponent = new ComponentModel(component);
//                     newComponent.save(function (err, component) {
//                       if (err) { return next(err); }
//                         //res.json(component);
//                         console.log("SAVING COMPONENT ::");
//                         console.log("RR");
                        
//                         //console.log(component);
//                         returnResponse.push(component);
//                         console.log(returnResponse);
//                     }); 
//             }, function(err) {
//                 if (err) return next(err);
//                 console.log("SOME OTHER ERROR AVOIDED!");
//                 //Tell the user about the great success
//                 // res.json({
//                 //     success: true,
//                 //     message: componentList.length+' component was saved.',
//                 //     recipe: recipe
//                 // });
//                 returnResponse.push(component);
//             });

//           //res.json(recipe);
          
//           console.log("RR - SERVER RESPONSE");
//           console.log(returnResponse);
//           res.json(returnResponse);
//       }); 
//     }
//   });

// });

// Read Recipe
app.get('/readRecipe', auth, function (req, res) {
  UserModel.find(function (err, recipe) {
    res.json(recipe);
  });
});

// Update Recipe
app.post("/updateRecipe", auth, function (req, res) {
  console.log("server - updateRecipe REST");
  var query = {"_id": req.body._id};
  RecipeModel.findOneAndUpdate(query, req.body, {upsert: false}, function (err, recipe) {
    if (err) throw err;
    // we have the updated unit returned to us
    res.json(recipe);
  });
});

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
