var app = angular.module('app', ['ngRows','ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'ui.select', 'ngSanitize','datatables']);
app.controller('main', function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder) {
  $scope.vizImplemented = true;
  $scope.showTable = false;
  $scope.columnNames = [];
  // check if this is here
  // TODO:
  /*load select distinct PUB_AGENCY_NAME/PUB_AGENCY_UNIT/DATA_YEAR from hate_crime1
    add to API to support all three
    make select box for DATA_YEAR or else number input restricted to available years
    implement typeaheads for pub agency name and pub agency unit DONE
    implement typeaheads for other relevant categories DONE
    add date inputs, add to API to support before and after dates DONE
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
                    START_DATE:'',
                    END_DATE:'',
                    COLUMN_NAME: undefined,
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
                    VICTIM_TYPES: [],
                    START_DATE:'',
                    END_DATE:'',
                    COLUMN_NAME: undefined,
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
  }

  $scope.clearParam = function(type){
    
    $scope.data[type] = [];
   
  }
  $scope.setParam = function(type){
    if($scope.buff[type].length >0 ){
      $scope.data[type] = $scope.buff[type];
    }   
  }
  $scope.unsetParam = function(type){
    $scope.data[type] = undefined; 
    console.log('unset');
  }

  $scope.reset = function(){
    initArrays();
  }



  // on load
  $scope.data.type = 'start';

  var postData = JSON.stringify($scope.data);


  $http({
      method: "POST",
      url: "../../cgi-bin/dev-datadownlow/api",
      data: "data=" + postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        // console.log(response.data.COLUMN_NAME)
        // console.log(JSON.parse(response.data));
        $scope.initData = response.data;

        // converts each obj to an array, which we need for ui-select
        Object.keys($scope.initData).forEach(function(key) {
            $scope.initData[key] = objectToArray($scope.initData[key]) ;
        });
        $scope.initData['COLUMN_NAME'].push('INCIDENT_YEAR')
        // $scope.initData['BIAS_DESC'] = objectToArray($scope.initData.BIAS_DESC);
        // console.log($scope.initData);
    });

  $scope.showTable = true;

  function objectToArray(obj){
    obj = Object.keys(obj).map(function(k){ 
      return obj[k] 
    });
    return obj
  };

  // $scope.haveData = checkData();

  // $scope.checkData = function() {
  //   return typeof $scope.data != undefined
  // }
  $scope.checkData = true;

  $scope.getData = function (){
    $scope.showTable = true;
    // console.log($scope.data.COLUMN_NAME);
    if(typeof $scope.data.COLUMN_NAME != 'undefined' && $scope.data.COLUMN_NAME.length > 0){
      $scope.data.type = 'sum';
    } else {
      $scope.data.type = 'filter';
    }
    
    var postData = JSON.stringify($scope.data);
    // console.log($scope.data);
    $http({
      method: "POST",
      url: "../../cgi-bin/dev-datadownlow/api",
      data: "data=" + postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        $scope.fileName = response.data;
        // console.log($scope.fileName);

        $http({
          method: "POST",
          url: $scope.fileName
        }).then(function(response) {
          // success(function(data){      
          // trying this http://plnkr.co/edit/TzBaaZ2Msd9WchfLDLkN?p=preview
          var data = $.csv.toObjects(response.data);
          var sample = data[0], dtColumns = []
          
          for (var key in sample) {
            dtColumns.push(
              DTColumnBuilder.newColumn(key).withTitle(key)
            );
          }
          $scope.dtColumns = dtColumns
          $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('data', data)
            .withOption('dataSrc', '')          
     
          angular.element('#main-table').attr('datatable', '')
          $compile(angular.element('#main-table'))($scope)

          $scope.checkData = false;

          // // save for later, it works
          // // $scope.data = $.csv.
          // $scope.responseData = $.csv.toObjects(response.data);
          // $scope.checkData = false;
          // console.log($scope.responseData);
          // getColumns($scope.responseData[0]);

          // setTimeout(function(){
          //   $scope.makeTable();
          // }, 10000);
          // // $(document).ready(function() {
          // //   $('#main-table').DataTable();
          // // });
        }); 
    });
  }

  // this works, it just needs to be called after the table is created
  // $scope.makeTable = function(){
  //   $(document).ready(function() {
  //           $('#main-table').DataTable();
  //         });
  // }

  $scope.tableColumns = [];
  function getColumns(object){
    $scope.tableColumns = [];
    Object.keys(object).forEach(function(key) {
            $scope.tableColumns.push(key);
    });
    // console.log($scope.tableColumns)
    
  }

  // $scope.testFunction = function (){
  //   console.log('repeat done');
  // }

      



});

// https://coderwall.com/p/5dpe2w/execute-function-when-ngrepeat-done
// can't get this to work
app.directive('repeatDone', function() {
  return function($scope, element, attrs) {
    element.bind('$destroy', function(event) {
      if ($scope.$last) {
        $scope.$eval(attrs.repeatDone);
      }
    });
  }
});