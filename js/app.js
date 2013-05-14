$(document).foundation();

angular.module("app", [])

  .factory('dbService', function() {
    return {
      ref: new Firebase('https://openhome.firebaseio.com/')
    };
  })

  .factory('authService',
           ['dbService', '$rootScope', '$q',
            function(dbService, $rootScope, $q) {
    return {
      user: function() {
        return $rootScope.user;
      },
      login: function() {
        if ($rootScope._deferred) {
          $rootScope._deferred.reject();
        }
        $rootScope._deferred = $q.defer();
        this._client.login('persona');
      },
      logout: function() {
        if ($rootScope._deferred) {
          $rootScope._deferred.reject();
        }
        $rootScope._deferred = $q.defer();
        this._client.logout();
      },
      _client: new FirebaseAuthClient(dbService.ref, function(error, user) {
        $rootScope.$apply(function() {
          if (error) {
            $rootScope.user = null;
            if ($rootScope._deferred) {
              $rootScope._deferred.reject();
              $rootScope._deferred = null;
            }
          } else if (user) {
            $rootScope.user = user;
            if ($rootScope._deferred) {
              $rootScope._deferred.resolve(user);
              $rootScope._deferred = null;
            }
          } else {
            $rootScope.user = null;
            if ($rootScope._deferred) {
              $rootScope._deferred.resolve();
              $rootScope._deferred = null;
            }
          }
        });
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
      authService.login();
    };
    $scope.signout = function() {
      authService.logout();
    };
  }]);
