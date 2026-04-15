/*global console*/
//var $ = require("jquery");
// require('angular');
// require('angular-route');
// require('angular-resource');

require('bootstrap/dist/css/bootstrap.css');

require('../../sass/main.scss');
// Loads all the boostrap js files
//require('bootstrap');

angular.module('jscomicdb',['ngRoute'])

   // .config(['$routeProvider','$locationPr ovider',function($routeProvider,$locationProvider) {
   //     $routeProvider
   //       .when('/admin',{template:'This is the computers Route'});
   //
   //       $locationProvider.html5Mode(true);
   // }])

   .controller('jsTitles',['$scope','$http',function($scope,$http){

        $scope.heyNow = "Showcase Floyd";

        $http.get('/list').then(function(response){
            console.log(response);
            $scope.titles = response.data.titles;
        });

        $scope.grabSeries = function(id){
            console.log("Title", id);
            $scope.openSeries = id;
            $http.get('/list/'+id)
                .then(function(response){
                   console.log(response.data);
                   $scope.series = response.data;
                });
        };


        $scope.grabIssues = function(id){
            console.log("Book", id);
            $http.get('/issues/'+id)
                .then(function(response){
                    console.log(response.data);
                    $scope.issues = response.data;
                });
        };

        $scope.grabIssue = function(id){
            console.log("Issue Id", id);
            $http.get('/issue/'+id)
                .then(function(response){
                    console.log(response.data);
                    $scope.issue = response.data;
                });
        };

    }]);
