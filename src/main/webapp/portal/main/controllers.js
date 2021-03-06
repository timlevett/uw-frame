'use strict';

define(['angular','require'], function(angular, require) {
  var app = angular.module('portal.main.controllers', []);

  app.controller('MainController', ['$localStorage', '$sessionStorage','$scope', '$document', 'NAMES', 'MISC_URLS', 'APP_FLAGS', function($localStorage, $sessionStorage, $scope, $document, NAMES, MISC_URLS, APP_FLAGS) {
    var defaults = {
            showSidebar: !APP_FLAGS.hideSidebar,
            sidebarQuicklinks: false,
            showKeywordsInMarketplace : false,
            homeImg : "img/square.jpg",
            sidebarShowProfile: false,
            profileImg: "img/terrace.jpg",
            typeaheadSearch: false,
            exampleWidgets: false,
            layoutMode : 'list', //other option is 'widgets'
            gravatarEmail : null,
            useGravatar : false,
            webPortletRender : false,
            lastSeenFeature : -1
            };


    //=====functions ======
    var init = function(){
      $scope.$storage = $localStorage.$default(defaults);

      $scope.NAMES=NAMES;
      $scope.classicURL=MISC_URLS.back2ClassicURL;
      $scope.APP_FLAGS=APP_FLAGS;

      if(NAMES.title) {
        $document[0].title=NAMES.title;
      }
    }
    $scope.resetLocal = function() {
        $localStorage.$reset(defaults);
    };

    $scope.clearSession = function() {
        $sessionStorage.$reset();
    };

    $scope.reload = function() {
        location.reload();
    }

    //run init
    init();
  } ]);

  /* Username */
  app.controller('SessionCheckController', [ 'mainService', 'MISC_URLS', function(mainService, MISC_URLS) {
    var that = this;
    that.user = [];
    that.feedbackURL = MISC_URLS.feedbackURL;
    that.back2ClassicURL = MISC_URLS.back2ClassicURL;
    that.whatsNewURL = MISC_URLS.whatsNewURL;

    mainService.getUser().then(function(result){
      that.user = result;
    });
  }]);
  
  app.controller('PopupController', ['$localStorage', '$sessionStorage','$scope', '$document', 'APP_FLAGS', '$modal', 'featuresService', '$sanitize', function($localStorage, $sessionStorage, $scope, $document, APP_FLAGS, $modal, featuresService, $sanitize) {
     var openModal = function() {
      if (APP_FLAGS.features) {
        $scope.features = [];
        
        featuresService.getFeatures().then(function(data) {
            var features = data;
            if (features.data.length > 0) {
              $scope.features = features.data;
              $scope.latestFeature = $scope.features[$scope.features.length - 1]
              var today = Date.parse(new Date());
              var startDate = Date.parse(new Date($scope.latestFeature.popup.startYear, $scope.latestFeature.popup.startMonth, $scope.latestFeature.popup.startDay));
              var endDate = Date.parse(new Date($scope.latestFeature.popup.endYear, $scope.latestFeature.popup.endMonth, $scope.latestFeature.popup.endDay));
              
              // handle legacy local storage
              if ($localStorage.lastSeenFeature === -1) {
                if ($localStorage.hasSeenWelcome) {
                  $localStorage.lastSeenFeature = 1;
                } else {
                  $localStorage.lastSeenFeature = 0;
                }
                delete $localStorage.hasSeenWelcome;
              }
              
              // criteria to show popup
              var featureIsLive = today > startDate && today < endDate;
              var userHasNotSeenFeature = $localStorage.lastSeenFeature < $scope.latestFeature.id;
              var featureIsEnabled = $scope.latestFeature.popup.enabled;
              
              
              if (featureIsLive && userHasNotSeenFeature && featureIsEnabled) {
                $modal.open({
                  animation: $scope.animationsEnabled,
                  templateUrl: require.toUrl('./partials/features-modal-template.html'),
                  size: 'lg',
                  scope: $scope 
                });
                $localStorage.lastSeenFeature = $scope.latestFeature.id;
              }
            }
        });
      }
    };
    
    openModal();
    
  }]);
  

  /* Header */
  app.controller('HeaderController', ['$scope','$location', 'NAMES', 'APP_FLAGS', function($scope, $location, NAMES, APP_FLAGS) {
    this.navbarCollapsed = true;
    this.crest = NAMES.crest;
    this.crestalt = NAMES.crestalt;
    this.sublogo = NAMES.sublogo;
    $scope.showSearch = false;
    $scope.showSearchFocus = false;
    $scope.APP_FLAGS = APP_FLAGS;

    this.toggleSearch = function() {
        $scope.showSearch = !$scope.showSearch;
        $scope.showSearchFocus = !$scope.showSearchFocus;
    }
  }]);

  /* Footer */
  app.controller('FooterController', ['$scope', function($scope) {
      $scope.date = new Date();

  }]);

  app.controller('SidebarController',[ '$localStorage', '$scope', 'mainService', function($localStorage, $scope, mainService) {
      $scope.$storage = $localStorage;
      $scope.sidebar = [];
      mainService.getSidebar().then(function(result){
          $scope.sidebar = result.data.sidebar;
      });

      this.canSee = function(storageVar) {
          if(storageVar === '')
              return true;
          else {
              return $scope.$storage[storageVar];
          }
      }
  }]);

  return app;

});
