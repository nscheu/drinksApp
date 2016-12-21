app.controller('RegisterCtrl', function ($scope, $http, $rootScope, $location) {
  
  $scope.register = function (user) {
    //console.log(user);
    //include password validation HERE (password and password2)
    if (user.password == user.password2) {
      $http.post('/createUser', user)
        .success(function (user) {
          $rootScope.currentUser = user;
          //console.log(user);
          $location.url("/profile");
    });
    }
    
  };
});