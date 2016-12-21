app.controller('ProfileCtrl', function ($scope, $http, $location, $rootScope) {


  $http.post("/rest/recipe_list", { user_id: $scope.currentUser._id })
       .success(function (resource) {
         console.log(resource);
         $scope.currentUser.recipe_list = resource;
       });

$http.post("/rest/location_list", { user_id: $scope.currentUser._id })
       .success(function (resource) {
         console.log(resource);
         $scope.currentUser.location_list = resource;
       });

  $scope.openUpdateUserModal = function (user) {
    $scope.updateUser = user;
    $("#openUpdateUserModal").modal('show');
  };
  $scope.openUpdateItemModal = function (item) {
    $scope.updateItem = item;
    $("#openUpdateItemModal").modal('show');
  };

   $scope.openUpdateLocationModal = function (location) {
    $scope.updateLocation = location;
    $("#openUpdateLocationModal").modal('show');
  };


  //Updates the user
  $scope.updateUserInDb = function (updatedUser) {
    $("#openUpdateUserModal").modal('hide');
    $http.post("/updateUser", updatedUser)
       .success(function (resource) {
         $scope.currentUser = resource;
       });
  };

  //Updates the item
  $scope.updateUnitInDb = function (updatedUnit) {
    $("#openUpdateUnitModal").modal('hide');
    console.log(updatedItem);
    $http.post("/updateUnit", updatedUnit)
       .success(function (resource) {
        console.log(resource);
         for(var i = 0; i < $scope.currentUser.unit.length; i++){
          if($scope.currentUser.item_list[i]._id === resource._id){
            $scope.currentUser.item_list[i] = updatedUnit;
          }
        }
       });
  };

//Updates the Location
  $scope.updateLocationInDb = function (updatedLocation) {
    $("#openUpdateLocationModal").modal('hide');
    console.log(updatedLocation);
    $http.post("/rest/updateLocation", updatedLocation)
       .success(function (resource) {
        console.log(resource);
         for(var i = 0; i < $scope.currentUser.location_list.length; i++){
          if($scope.currentUser.location_list[i]._id === resource._id){
            $scope.currentUser.location_list[i] = updatedLocation;
          }
        }
       });
  };

 //delete user(user)
  $scope.delUser = function (user) {
    //var index = $scope.users.indexOf(user);
    console.log("deleteUser - ProfileJS");
    console.log(user);
    //$scope.users.splice(index, 1);
    $http.post("/deleteUser", user)
      .success(function (deleteduser) {
        console.log("deletedUser =", user);
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

$scope.addLocationModal = function (location) {
    $("#addLocationModal").modal('show');
};

$scope.addRecipeToDB = function (recipe) {
  console.log("addRecipe to Db")
  $("#addRecipeModal").modal('hide');
  //var msg = { recipe: recipe, user: $scope.currentUser };
  recipe.creator = $scope.currentUser._id;
  //console.log(item);
  $http.post('/createRecipe', recipe)
    .success(function (recipe) {
      console.log("success createRecipe")
      //$scope.currentUser.item_list.push(item);
      $scope.currentUser.recipe_list.push(recipe);
      console.log($scope.currentUser.recipe_list);
    });
};

$scope.addLocationToDB = function (location) {
  console.log("addLocation to Db")
  $("#addLocationModal").modal('hide');
  location.user_id = $scope.currentUser._id;
  $http.post('/createLocation', location)
    .success(function (location) {
      console.log("success createItem")
      $scope.currentUser.location_list.push(location);
    });
};


$scope.deleteRecipe = function(recipe){
  //console.log($scope.item_list);
  var index = $scope.currentUser.recipe_list.indexOf(recipe);
  $scope.currentUser.recipe_list.splice(index, 1);

  $http.post("/rest/deleteRecipe", recipe)
      .success(function (rec) {
        console.log("deletedRecipe =", rec);
      });
}

$scope.delLocation = function(location){
  console.log($scope.location_list);
  var index = $scope.currentUser.location_list.indexOf(location);
  $scope.currentUser.location_list.splice(index, 1);

  $http.post("/rest/delLocation", location)
      .success(function (loc) {
        console.log("deletedLocation =", loc);
      });
}

// End Controller
});