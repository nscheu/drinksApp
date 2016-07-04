app.controller('CreateCtrl', function ($scope, $http, $rootScope, $location) {
  
  $scope.create = function (user) {
    console.log(user);
    //include password validation HERE (password and password2)
    if (user.password == user.password2) {
      $http.post('/create', user)
        .success(function (user) {
          $rootScope.currentUser = user;
          console.log(user);
          $location.url("/profile");
		    });
      }else{
		    console.log("password fail");
		    window.alert("Passwords do not match!");
      }
  }
});