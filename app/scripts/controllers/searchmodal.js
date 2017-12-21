'use strict';

/**
 * @ngdoc function
 * @name backendTheatreApp.controller:SearchmodalCtrl
 * @description
 * # SearchmodalCtrl
 * Controller of the backendTheatreApp
 */
angular.module('backendTheatreApp')
  .controller('SearchmodalCtrl', ['$scope','$uibModal',function ($scope,$uibModal) {
      //console.log(searchMovieText);
      //searchMovieText.set("Its hi now");
      $scope.open = function (size) {
          console.log(size);
          $uibModal.open({
              templateUrl: '/views/searchmodal.html',
              controller: 'IndexCtrl',
              size: size
          });
      };
  }]);
