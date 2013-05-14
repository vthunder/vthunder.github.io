$(document).foundation();

angular.module("app", [])

  .value('appurl', "http://localhost:8000/")
  .value('firebaseurl', "https://openhome.firebaseio.com/")
  .value('client_id', "798c72ca5049c8da83542ec260ecf9e9")

  .config(['$locationProvider',
        function($locationProvider) {
//    $locationProvider
//      .html5Mode(false)
//      .hashPrefix('!');
  }])

  .factory('dbRoot', ['firebaseurl', function(firebaseurl) {
    return new Firebase(firebaseurl);
  }])

  .factory('userSvc',
           ['dbRoot', '$rootScope', '$http', '$window',
            function(dbRoot, $rootScope, $http, $window) {

    $rootScope.user = {
      auth: {
        lastError: null,
      },
      data: {}
    };

    return {
      login: function() {
        this.client.login('persona');
      },
      logout: function() {
        this.client.logout();
        $rootScope.user.auth.firebase = null;
      },
      connect: function(service) {
        var redirect_uri = encodeURIComponent(appurl);
        var singly = $rootScope.user.auth.singly;
        var access_token = singly? singly.access_token : "";

        var url = "https://api.singly.com/oauth/authenticate" +
          "?client_id=" + client_id +
          "&redirect_uri=" + redirect_uri +
          "&service=" + service +
          access_token? ("&access_token=" + access_token) : "" +
          "&response_type=token";

        $window.location.href = url;
      },
      singlyConnected: function(access_token, account) {
        $rootScope.user.auth.singly = {
          access_token: access_token,
          account: account
        }
        $http.get("https://api.singly.com/profile?access_token=" + access_token)
          .success(function(data) {
            $rootScope.user.data.profile = data;
          })
          .error(function(data) {
            alert("error: " + data);
          });
      },
      client: new FirebaseAuthClient(dbRoot, function(error, user) {
        $rootScope.$apply(function() {
          if (error)
            $rootScope.user.auth.lastError = error;
          else if (user)
            $rootScope.user.auth.firebase = user;
          else
            $rootScope.user.auth.firebase = null;
        });
      })
    };
  }])

  .controller('AppCtrl',
              ['$scope', '$rootScope', '$window', 'userSvc', 'appurl', 'client_id',
               function($scope, $rootScope, $window, userSvc, appurl, client_id) {

    $scope.user = function() {
      return $rootScope.user;
    };
    $scope.signedIn = function() {
      return $rootScope.user.auth.firebase? true : false;
    };

    $scope.signin = function() { userSvc.login(); };
    $scope.signout = function() { userSvc.logout(); };
    $scope.connect = function(service) { userSvc.connect(service); };
  }])

  .run(['$location', '$http', 'userSvc',
        function($location, $http, userSvc) {
    var url = purl($location.absUrl());
    var access_token = url.fparam('access_token') || url.fparam('/access_token');
    var account = url.fparam('account') || url.fparam('/account');
    if (access_token) {
      userSvc.singlyConnected(access_token, account);
    }
  }]);
