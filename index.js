var app = angular.module('app', ['ngRows']);
app.controller('main', function($scope, $http) {
  $scope.showTable = false;
  $scope.columnNames = [];

  // on load
  $http({
      method: "POST",
      url: "../../cgi-bin/datadownlow/api",
      data: "type=start",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        console.log(response.data.COLUMN_NAME)
        // console.log(JSON.parse(response.data));
        $scope.initData =response.data
       

        // console.log($scope.columnNames);
    });

  $scope.showTable = true;
    

  $scope.getData = function (){
    $scope.showTable = true;
    $http({
      method: "POST",
      url: "../../cgi-bin/datadownlow/api",
      data: "type=test",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        $scope.fileName = response.data;

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