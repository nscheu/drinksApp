app.controller('ProfileCtrl', function ($scope, $http, $location, $rootScope) {

//console.log($rootScope.currentUser);


  $http.post("/rest/unit_list")
       .success(function (resource) {
         //console.log(resource);
         $scope.units = resource;
         console.log($scope.units);
       });

  // $http.post("/rest/recipe_list", { user_id: $scope.currentUser._id })
  //      .success(function (resource) {
  //        //console.log(resource);
  //        $scope.recipeComponents = resource;
  //      });

  $http.post("/rest/recipe_list", { user_id: $scope.currentUser._id })
       .success(function (resource) {
         //console.log(resource);
         $scope.recipe_list = resource;
       });

  $http.post("/rest/bar_list", { user_id: $scope.currentUser._id })
       .success(function (resource) {
         //console.log(resource);
         $scope.bar_list = resource;
       });

  $scope.recipeComponents = [{id: 'comp1'}];
  
  $scope.addNewChoice = function() {
    var newItemNo = $scope.recipeComponents.length+1;
    $scope.recipeComponents.push({'id':'comp'+newItemNo});
  };
    
  $scope.removeChoice = function() {
    var lastItem = $scope.recipeComponents.length-1;
    $scope.recipeComponents.splice(lastItem);
  };



  $scope.openUpdateUserModal = function (user) {
    $scope.updateUser = user;
    $("#openUpdateUserModal").modal('show');
  };
  $scope.openUpdateRecipeModal = function (recipe) {
    $scope.updateRecipe = recipe;
    $("#openUpdateRecipeModal").modal('show');
  };

  //Updates the user
  $scope.updateUserInDb = function (updatedUser) {
    $("#openUpdateUserModal").modal('hide');
    $http.post("/updateUser", updatedUser)
       .success(function (resource) {
         $scope.currentUser = resource;
       });
  };

  // Sets the Recipe public value to the opposite
  $scope.alternateRecipeBool = function (recipe){
    recipe.publick = !recipe.publick;
    $scope.updateRecipeInDb(recipe);
  };

  //Updates the Recipe
  $scope.updateRecipeInDb = function (updatedRecipe) {
    $("#openUpdateRecipeModal").modal('hide');
    //console.log(updatedRecipe);
    $http.post("/updateRecipe", updatedRecipe)
       .success(function (resource) {
        for(var i = 0; i < $scope.recipe_list.length; i++){
           if($scope.recipe_list[i]._id === resource._id){
             $scope.recipe_list[i] = updatedRecipe;
           }
        }
       });
  };


 //delete user(user)
  $scope.delUser = function (user) {
    //console.log("deleteUser - ProfileJS");
    $http.post("/deleteUser", user)
      .success(function (deleteduser) {
        //console.log("deletedUser =", user);
        $http.post('/logout')
          .success(function(){
          $scope.currentUser = null;
          $location.url("/logout");
          //callback();
        })
      });
  };

$scope.addRecipeModal = function (recipe) {
    $("#addRecipeModal").modal('show');
};

$scope.addBarModal = function (location) {
    $("#addBarModal").modal('show');
};

$scope.addRecipeToDB = function (recipe, componentList) {
  //console.log("addRecipe to Db")
  $("#addRecipeModal").modal('hide');
  //console.log(componentList.unit.name);
  recipe.creator = $scope.currentUser._id;
  recipe.publick = false;

  //console.log(componentList);
  for(var comp in componentList){
    componentList[comp].creator = $scope.currentUser._id;
    componentList[comp].unit.creator = $scope.currentUser._id;
    //console.log(componentList[comp]);
    //var unitName = componentList[comp].unit.name;
    //componentList[comp].unit =
    
  }

  //console.log(componentList);
  // var recipePacket = {
  //   recipe: recipe,
  //   compList: componentList
  // }
  
  recipe.component_list = componentList;

  //$http.post('/createRecipe', recipePacket)
  $http.post('/createRecipe', recipe)
    .success(function (resp) {
      //console.log("success createRecipe")
      console.log(resp);
      $scope.recipe_list.push(resp);
    });
};

$scope.addBarToDB = function (component) {
  //console.log("addBar to Db")
  $("#addBarModal").modal('hide');
  component.creator = $scope.currentUser._id;
  $http.post('/createIngredient', component)
    .success(function (component) {
      //console.log("success createItem")
      $scope.bar_list.push(component);
    });
};


$scope.deleteRecipe = function(recipe){
  $http.post("/deleteRecipe", recipe)
      .success(function (rec) {
        //console.log("deletedRecipe =", rec);
        var index = $scope.recipe_list.indexOf(recipe);
        $scope.recipe_list.splice(index, 1);
      });
}

$scope.deleteIngredient = function(ingredient){
  $http.post("/deleteIngredient", ingredient)
      .success(function (ing) {
        //console.log("deletedLocation =", ing);
        var index = $scope.bar_list.indexOf(ingredient);
        $scope.bar_list.splice(index, 1);
      });
}

// End Controller
});