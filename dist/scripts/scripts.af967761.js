"use strict";angular.module("backendTheatreApp",["ngAnimate","ngAria","ngCookies","ngMessages","ngResource","ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"about"}).otherwise({redirectTo:"/"})}]),angular.module("backendTheatreApp").controller("MainCtrl",["$scope",function(a){a.images="../images/add_to_cart_button.22023a82.png",a.add_to_cart=!1,a.with_cart=!1,a.show_add_to_cart=function(){a.add_to_cart=!0,a.with_cart=!0},a.hide_add_to_cart=function(){a.add_to_cart=!1,a.with_cart=!1},a.movieComingSoon=[{image:"../images/cs2png",date:"16",month:"June"},{image:"../images/cs3.8d88200f.png",date:"16",month:"June"},{image:"../images/cs4.25544f98.png",date:"16",month:"June"},{image:"../images/cs4.25544f98.png",date:"16",month:"June"},{image:"../images/cs2.7b6b83d5.png",date:"16",month:"June"},{image:"../images/cs3.8d88200f.png",date:"16",month:"June"},{image:"../images/cs3.8d88200f.png",date:"16",month:"June"},{image:"../images/cs2.7b6b83d5.png",date:"16",month:"June"}],a.movieNowShowing=[{image:"../images/img1.44f64449.png",list_show_none:["1:35 pm","4:00 pm","6:35 pm","9:15 pm"]},{image:"../images/img2.d1a0d1eb.png",list_show_3d:["6:30 pm"],list_show_3d_image:"../images/3d_text.c446f5e3.png",list_show_2d:["6:00 pm","6:15 pm"],list_show_2d_image:"../images/2d_text.63ac96db.png"},{image:"../images/img3.5fa1262f.png",list_show_3d:["1:05 pm","3:55 pm","6:40 pm","9:20 pm"],list_show_3d_image:"../images/3d_text.c446f5e3.png",list_show_2d:["12:50 pm","3:40 pm","6:30 pm","9:10 pm"],list_show_2d_image:"../images/2d_text.63ac96db.png"},{image:"../images/img1.44f64449.png",list_show_none:["1:35 pm","4:00 pm","6:35 pm","9:15 pm"]},{image:"../images/img1.44f64449.png",list_show_none:["1:35 pm","4:00 pm","6:35 pm","9:15 pm"]},{image:"../images/img1.44f64449.png",list_show_none:["1:35 pm","4:00 pm","6:35 pm","9:15 pm"]}]}]),angular.module("backendTheatreApp").controller("AboutCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("backendTheatreApp").directive("addToCart",function(){return{restrict:"E",template:'<a ng-href=\'#\'><img src="../images/add_to_cart_button.22023a82.png" class="align_add_to_cart"  ></a>'}}),angular.module("backendTheatreApp").run(["$templateCache",function(a){a.put("views/about.html","<p>This is the about view.</p>"),a.put("views/main.html",'<div class="row&quot;" ng-controller="MainCtrl"> <div class="col-md-12" id="main_view"> <div class="row"> <div class="container"> <div class="col-md-1" id="top-angle-left"> <p><a ng-href=""><i class="fa fa-angle-left fa-3x"></i></a></p> </div> <div class="col-md-10"> <!--<h1><img src="../images/Now_Showing.925ca794.png"></h1>--> <div class="col-md-4" id="left_banner_now_showing"></div> <div class="col-md-4" id="now_showing_text">NOW SHOWING</div> <div class="col-md-4" id="right_banner_now_showing"></div> </div> <div class="col-md-1" id="top-angle-right"> <p><i class="fa fa-angle-right fa-3x"></i></p> </div> </div> <div class="container" id="show_list"> <div class="col-md-6 list_now_showing" ng-repeat="mvs in movieNowShowing"> <div class="wrap_all"> <!--<img class="images" src="../images/img1.44f64449.png">--> <img class="images" ng-src="{{mvs.image}}"> <div class="all_timings"> <div class="list-show-none"> <span ng-repeat="list_show in mvs.list_show_none">{{list_show}}</span> </div> <div class="list-show-3d"> <span><img ng-src="{{mvs.list_show_3d_image}}"> </span> <span ng-repeat="list_show in mvs.list_show_3d">{{list_show}}</span> </div> <div class="list-show-2d"> <!--<img ng-src="">--> <span><img ng-src="{{mvs.list_show_2d_image}}"></span> <span ng-repeat="list_show in mvs.list_show_2d">{{list_show}}</span> </div> </div> <add-to-cart class="align_add_to_cart show-cart"></add-to-cart> </div> </div> </div> </div> <div class="row"> <div class="container coming-soon"> <div class="col-md-12"> <div class="col-md-5" id="bottom-angle-left"> <p><i class="fa fa-angle-left fa-3x"></i></p> </div> <div class="col-md-2"> <h1 id="coming_soon_text">Coming Soon</h1> </div> <div class="col-md-5" id="bottom-angle-right"> <p><i class="fa fa-angle-right fa-3x"></i></p> </div> </div> </div> <div class="container" id="coming-soon"> <div class="col-md-3" id="list_coming_soon" ng-repeat="mcs in movieComingSoon"> <div class="parent"> <div class="imagewrap"> <div class="date_month"> <h1 class="coming_soon_date">{{mcs.date}}</h1> <h1 class="coming_soon_month">{{mcs.month}}</h1> </div> <img class="coming_soon_circle" src="../images/circle.afe12f4b.png"> </div> <img class="coming_soon_images" ng-src="{{mcs.image}}"> </div> <!--<li>--> <!--<div class="parent">--> <!--<div class="imagewrap">--> <!--<div class="date_month">--> <!--<h1 class="coming_soon_date">23</h1>--> <!--<h1 class="coming_soon_month">September</h1>--> <!--</div>--> <!--<img class="coming_soon_circle" src="../images/circle.afe12f4b.png">--> <!--</div>--> <!--<img class="coming_soon_images" src="../images/cs3.8d88200f.png">--> <!--</div>--> <!--</li>--> <!--<li>--> <!--<div class="parent">--> <!--<div class="imagewrap">--> <!--<div class="date_month">--> <!--<h1 class="coming_soon_date">21</h1>--> <!--<h1 class="coming_soon_month">June</h1>--> <!--</div>--> <!--<img class="coming_soon_circle" src="../images/circle.afe12f4b.png">--> <!--</div>--> <!--<img class="coming_soon_images" src="../images/cs4.25544f98.png">--> <!--</div>--> <!--</li>--> <!--<li>--> <!--<div class="parent">--> <!--<div class="imagewrap">--> <!--<div class="date_month">--> <!--<h1 class="coming_soon_date">14</h1>--> <!--<h1 class="coming_soon_month">April</h1>--> <!--</div>--> <!--<img class="coming_soon_circle" src="../images/circle.afe12f4b.png">--> <!--</div>--> <!--<img class="coming_soon_images" src="../images/cs5.3124a3da.png">--> <!--</div>--> <!--</li>--> </div> </div> </div> </div> </div>')}]);