app.controller('ProfileCtrl', function ($scope, $http, $location, $rootScope) {


  $http.post("/rest/item_list", { user_id: $scope.currentUser._id })
       .success(function (resource) {
         console.log(resource);
         $scope.currentUser.item_list = resource;
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
    $http.post("/api/updateUser", updatedUser)
       .success(function (resource) {
         $scope.currentUser = resource;
       });
  };

  //Updates the item
  $scope.updateItemInDb = function (updatedItem) {
    $("#openUpdateItemModal").modal('hide');
    console.log(updatedItem);
    $http.post("/rest/updateItem", updatedItem)
       .success(function (resource) {
        console.log(resource);
         for(var i = 0; i < $scope.currentUser.item_list.length; i++){
          if($scope.currentUser.item_list[i]._id === resource._id){
            $scope.currentUser.item_list[i] = updatedItem;
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
    console.log("delUser - ProfileJS");
    console.log(user);
    //$scope.users.splice(index, 1);
    $http.post("/rest/delUser", user)
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

$scope.addItemModal = function (item) {
    $("#addItemModal").modal('show');
};

$scope.addLocationModal = function (location) {
    $("#addLocationModal").modal('show');
};

$scope.addItemToDB = function (item) {
  console.log("addItem to Db")
  $("#addItemModal").modal('hide');
  //var msg = { item: item, user: $scope.currentUser };
  item.user_id = $scope.currentUser._id;
  //console.log(item);
  $http.post('/createItem', item)
    .success(function (item) {
      console.log("success createItem")
      $scope.currentUser.item_list.push(item);
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


$scope.delItem = function(item){
  console.log($scope.item_list);
  var index = $scope.currentUser.item_list.indexOf(item);
  $scope.currentUser.item_list.splice(index, 1);

  $http.post("/rest/delItem", item)
      .success(function (it) {
        console.log("deletedItem =", it);
       
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