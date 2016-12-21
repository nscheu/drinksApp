var app = angular.module('PassportApp', ['ngRoute']);

app.config(function($routeProvider, $httpProvider) {
  $routeProvider
  .when('/create', {
      templateUrl: '/views/create/create.html',
      controller: 'CreateCtrl'
    })
  .when('/profile', {
    templateUrl: '/views/profile/profile.html',
    controller: 'ProfileCtrl',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
   .when('/', {
     templateUrl: '/views/home.html',
     controller: 'HomeCtrl'
   })
    .when('/login', {
    templateUrl: '/views/login/login.html',
    controller: 'LoginCtrl'
    })
    .when('/register', {
      templateUrl: '/views/register/register.html',
      controller: 'RegisterCtrl'
    })
    .when('/users', {
      templateUrl: '/views/users/users.html',
      controller: 'UsersCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });

  $httpProvider
  .interceptors
  .push(function($q, $location){
    return {
      response: function(response) {
        return response;
      },
      responseError: function(response){
        if(response.status === 401)
          $location.url('/login');
        return $q.reject(response);
      }
    };
  });
});



var checkLoggedIn = function ($q, $timeout, $http, $location, $rootScope) {
  var deferred = $q.defer();

  $http.get('/loggedin').success(function (user) {
    //console.log('checkLoggedIn');
    //console.log(user);

    $rootScope.errorMessage = null;
    //User is Authenticated
    if (user !== '0') {
      $rootScope.currentUser = user;
      deferred.resolve();
    }
      //User is Not Authenticated
    else {
      $rootScope.errorMessage = 'You need to log in.';
      deferred.reject();
      $location.url('/login');
    }
  });
  return deferred.promise;
}

app.controller('NavCtrl', function ($rootScope, $scope, $http, $location) {
  console.log("NavCtrl Controller");
  $scope.logout = function () {
    $http.post("/logout")
    .success(function () {
      $rootScope.currentUser = null;
      $location.url("/login");
    });
  }
});

app.controller('HomeCtrl', function($scope, $http, $rootScope, $location) {
    $http.post("/rest/public_recipe_list")
       .success(function (resource) {
         $scope.recipes = resource;
       });
});



app.factory('SecurityService', function ($http, $location, $rootScope) {

  var login = function (user, callback) {
    //console.log(user);
    $http.post('/login', user)
    .success(function(user){
      $rootScope.currentUser = user;
      callback(user);
    });
  }

  var logout = function(callback) {
    $http.post('/logout')
    .success(function(){
      $rootScope.currentUser = null;
      callback();
    })
  }
  return {
    login: login,
    logout: logout
  }
});