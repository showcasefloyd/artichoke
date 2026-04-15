//var $ = require("jquery");
// require('angular');
// require('angular-route');
// require('angular-resource');

angular.module('jsComicDBAdmin', [])
  .controller('adminController', ['$scope', '$http', function ($scope, $http) {

    $scope.action = "New Form";

    $http.get('/list').then(function (response) {
      console.log(response.data);
      $scope.titles = response.data.titles;
    });

    $scope.loadTitle = function () {
      console.log("Calling Load Title", $scope.title.id);

        if(!$scope.title.id){
            $scope.error = "Missing Title ID"
            return
        };

      $http.get('/title/' + $scope.title.id)
        .then(function (response) {
          $scope.error = "";
          console.log("Loading titles", response.data);
          // Flag to load the view
          $scope.action = "loadTitle";
          $scope.record = response.data;
          $scope.edittitle = true;

          console.log("Status", response.status);
          console.log("Status Text", response.statustext);

        }, function (response) {
          console.log(response);
          console.log("Status", response.status);
          console.log("THIS IS A ERROR", response.statusText);
          })
    };

    $scope.createTitle = function () {
      console.log("Creating new title ");
      $scope.title = '';
      $scope.action = "createTitle";
    };

    $scope.updateTitle = function () {
      $scope.action = "updateTitle";
    };
  }]);
