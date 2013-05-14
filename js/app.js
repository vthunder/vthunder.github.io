$(document).foundation();

angular.module("app", [])

  .factory('dbRoot', function() {
    return new Firebase('https://openhome.firebaseio.com/');
  })

  .factory('auth',
           ['dbRoot', '$rootScope',
            function(dbRoot, $rootScope) {
    return {
      client: new FirebaseAuthClient(dbRoot, function(error, user) {
        $rootScope.$apply(function() {
          if (error) {
            $rootScope.userLoginError = error;
            $rootScope.user = null;
          } else if (user) {
            $rootScope.userLoginError = null;
            $rootScope.user = user;
          } else {
            $rootScope.userLoginError = null;
            $rootScope.user = null;
          }
        });
      })
    };
  }])

  .controller('UserCtrl',
              ['$scope', '$rootScope', 'auth',
               function($scope, $rootScope, auth) {
    $scope.user = function() {
      return $rootScope.user;
    };
    $scope.signin = function() {
      auth.client.login('persona');
    };
    $scope.signout = function() {
      auth.client.logout();
      $rootScope.user = null;
    };
  }]);
