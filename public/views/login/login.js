app.controller('LoginCtrl', function ($location, $scope, $http, $rootScope) {
  $scope.login = function (user) {
    $http.post('/login', user)
    .success(function (response) {
      $rootScope.currentUser = user;
      console.log(user);
      $location.url("/profile");
    });
    
  }
});