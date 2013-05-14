$(document).foundation();

angular.module("app", [])

  .factory('dbService', function() {
    return {
      ref: new Firebase('https://openhome.firebaseio.com/')
    };
  })

  .factory('authService', 
           ['dbService', '$rootScope',
            function(dbService, $rootScope) {
    var state = {};
    return {
      user: function() { return state.user; },
      client: new FirebaseAuthClient(dbService.ref, function(error, user) {
        if (user) {
          state.user = user;
          $rootScope.$emit("login", state.user);
          $rootScope.$emit("loginEvent");
        } else if (error) {
          state.user = undefined;
          $rootScope.$emit("loginError", error);
          $rootScope.$emit("loginEvent");
        } else {
          state.user = undefined;
          $rootScope.$emit("logout");
          $rootScope.$emit("loginEvent");
        }
      })
    };
  }])

  .controller('UserCtrl',
              ['$scope', 'authService',
               function($scope, authService) {
    $scope.user = function() {
      return authService.user();
    };

    $scope.signin = function() {
      authService.client.login('persona');
    };
    $scope.signout = function() {
      authService.client.logout();
    };
    $scope.foo = function() {
    };
  }]);
