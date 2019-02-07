var app = angular.module('app', ['ngRows','ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'ui.select', 'ngSanitize']);
app.controller('main', function($scope, $http) {
  $scope.vizImplemented = true;
  $scope.showTable = false;
  $scope.columnNames = [];

  // TODO:
  /*load select distinct PUB_AGENCY_NAME/PUB_AGENCY_UNIT/DATA_YEAR from hate_crime1
    add to API to support all three
    make select box for DATA_YEAR or else number input restricted to available years
    implement typeaheads for pub agency name and pub agency unit
    implement typeaheads for other relevant categories
    add date inputs, add to API to support before and after dates
  */

  // data from inputs
  function initArrays(){
    $scope.buff = { AGENCY_TYPE_NAME: '', 
                    BIAS_DESC: '', 
                    LOCATION_NAME: '', 
                    OFFENDER_ETHNICITY: '',
                    OFFENDER_RACE: '',
                    OFFENSE_NAME: '',
                    POPULATION_GROUP_DESC: '',
                    STATE_NAME: '',
                    VICTIM_TYPES: '',
                  };

    // data to send to API
    $scope.data = { AGENCY_TYPE_NAME: [], 
                    BIAS_DESC: [], 
                    LOCATION_NAME: [],
                    OFFENDER_ETHNICITY: [],
                    OFFENDER_RACE: [],
                    OFFENSE_NAME: [],
                    POPULATION_GROUP_DESC: [],
                    STATE_NAME: [],
                    VICTIM_TYPES: []
                  };
  }
  initArrays();

  $scope.viewToggles = { what:true,
                         where:false,
                         who:false,
                         when:false,
                         why: false
                       };

  $scope.toggleOpen = function(section) {
    $scope.viewToggles[section] = !$scope.viewToggles[section];
  }

  // adds from buff to data
  $scope.addParam = function(type){
    if($scope.buff[type].length >0 ){
      $scope.data[type].push($scope.buff[type]);
    }
    console.log($scope.data[type]);
    console.log($scope.data[type].length);
  }
  $scope.clearParam = function(type){
    
    $scope.data[type] = [];
    console.log($scope.data[type]);
    console.log($scope.data[type].length);
  }

  $scope.reset = function(){
    initArrays();
  }



  // on load
  $scope.data.type = 'start';

  var postData = JSON.stringify($scope.data);


  $http({
      method: "POST",
      url: "../../cgi-bin/datadownlow/api",
      data: "data=" + postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        // console.log(response.data.COLUMN_NAME)
        // console.log(JSON.parse(response.data));
        $scope.initData = response.data;
        $scope.initData['BIAS_DESC1'] = objectToArray($scope.initData.BIAS_DESC);
        console.log($scope.initData.BIAS_DESC1);

        // $scope.BIAS_DESC = Object.values($scope.initData.BIAS_DESC);

        // $scope.selected = {value: $scope.initData.BIAS_DESC[0]};

        // console.log($scope.columnNames);
    });

  $scope.showTable = true;

  function objectToArray(obj){
    obj = Object.keys(obj).map(function(k){ 
      return obj[k] 
    });
    return obj
  };
    

  $scope.getData = function (){
    $scope.showTable = true;
    $scope.data.type = 'filter';

    var postData = JSON.stringify($scope.data);
    console.log($scope.data);
    $http({
      method: "POST",
      url: "../../cgi-bin/datadownlow/api",
      data: "data=" + postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        $scope.fileName = response.data;
        // console.log($scope.fileName);

        $http({
          method: "POST",
          url: $scope.fileName
        }).then(function(response) {
                
          $scope.data = $.csv.toArrays(response.data);

          console.log($scope.data);
        	
        });	
    });
  }

      



});