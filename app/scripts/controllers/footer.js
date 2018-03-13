'use strict';

/**
 * @ngdoc function
 * @name backendTheatreApp.controller:FooterCtrl
 * @description
 * # FooterCtrl
 * Controller of the backendTheatreApp
 */
angular.module('backendTheatreApp')
    .controller('FooterCtrl', function ($scope, apiKey) {
        $scope.currentYear = new Date().getFullYear();
        $scope.imagePath = config.imagePath;
    });
