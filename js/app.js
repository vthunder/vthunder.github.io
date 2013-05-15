$(document).foundation();

// find out host we're on
// sadtimes: global
var appurl = document.createElement('a');
appurl.href = "/";
appurl = appurl.href

angular.module("app", ['firebase'])

  .value('client_id', (appurl == "http://localhost:8000"?
                       "798c72ca5049c8da83542ec260ecf9e9" : // dev sandbox
                       "09d889f820287c976065fb270bdf987d")) // vthunder.github.io
  .value('firebaseurl', "https://openhome.firebaseio.com/")

  .factory('dbRoot', ['firebaseurl', function(firebaseurl) {
    return new Firebase(firebaseurl);
  }])

  .factory('authSvc',
           ['$rootScope', 'dbRoot', 'angularFire', 'firebaseurl',
            function($rootScope, dbRoot, angularFire, firebaseurl) {

    var auth = {};

    return {
      authInfo: function() {
        return auth;
      },
      signedIn: function() {
        return auth.id? true : false;
      },
      login: function() {
        this.client.login('persona');
      },
      logout: function() {
        this.client.logout();
        auth.id = null;
      },
      client: new FirebaseAuthClient(dbRoot, function(error, user) {
        if (error)
          auth.lastError = error;
        else if (user)
          auth.id = user.id;
        else
          auth.id = null;
        $rootScope.$broadcast('authStateChange');
      })
    };
  }])

  .factory('connector', 
           ['$rootScope', '$location', '$http', '$window',
            'authSvc', 'client_id', 'firebaseurl',
            function($rootScope, $location, $http, $window,
                     authSvc, client_id, firebaseurl) {
    var accts = {};
    var data = {};

    return {
      userAccts: function() {
        return accts;
      },
      userData: function() {
        return data;
      },
      connect: function(service) {
        var redirect_uri = encodeURIComponent(appurl);
        var access_token = accts.singly? accts.singly.access_token : "";

        var url = "https://api.singly.com/oauth/authenticate" +
          "?client_id=" + client_id +
          "&redirect_uri=" + redirect_uri +
          "&service=" + service +
          (access_token? ("&access_token=" + access_token) : "") +
          "&response_type=token";

        $window.location.href = url;
      },
      checkUrlParams: function() {
        var url = purl($location.absUrl());
        var access_token = url.fparam('access_token') || url.fparam('/access_token');
        var account = url.fparam('account') || url.fparam('/account');
        if (access_token) {
          connector.connectComplete(access_token, account);
        }
      },
      connectComplete: function(access_token, account) {
        accts.singly = {
          access_token: access_token,
          account: account
        };
        $rootScope.$broadcast('connectComplete');
        $http.get("https://api.singly.com/profile?access_token=" + access_token)
          .success(function(profile) {
            data.profile = profile;
            $rootScope.$broadcast('profileUpdated');
          })
          .error(function(err) {
            alert("error: " + err);
          });
      },
    };
  }])

  .controller('AppCtrl',
              ['$scope', 'authSvc', 'connector',
               function($scope, authSvc, connector) {

    var apply = function() { $scope.$safeApply($scope); };
    $scope.$on('authStateChange', apply);
    $scope.$on('profileUpdated', apply);

    $scope.user = function() { return authSvc.userInfo(); };
    $scope.userAccts = function() { return connector.userAccts(); };
    $scope.userData = function() { return connector.userData(); };
    $scope.signedIn = function() { return authSvc.signedIn(); };
    $scope.signin = function() { authSvc.login(); };
    $scope.signout = function() { authSvc.logout(); };
    $scope.connect = function(service) { connector.connect(service); };
  }])

  // init

  .run(['$rootScope', 'connector',
        function($rootScope, connector) {
    //when you add it to the $rootScope variable, then it's accessible
    //to all other $scope variables.
    $rootScope.$safeApply = function($scope, fn) {
      fn = fn || function() {};
      if($scope.$$phase) {
        //don't worry, the value gets set and AngularJS picks up on it...
        fn();
      }
      else {
        //this will fire to tell angularjs to notice that a change has happened
        //if it is outside of it's own behaviour...
        $scope.$apply(fn); 
      }
    };

    // Check for OAuth return (token in URL params)
    connector.checkUrlParams();
  }]);
