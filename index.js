var app = angular.module('app', ['ngRows','ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'ui.select', 'ngSanitize','datatables']);
app.controller('main', function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder) {
  $scope.vizImplemented = true;
  $scope.showTable = false;
  $scope.columnNames = [];
  $scope.vizFlag = false;
  $scope.dtInstance = {};
  $scope.columnsReady = false;
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
                    PUB_AGENCY_NAME: '',
                    PUB_AGENCY_UNIT: '',
                    DATA_YEAR: '',
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
                    PUB_AGENCY_NAME: [],
                    PUB_AGENCY_UNIT: [],
                    DATA_YEAR: [],
                    START_DATE:'',
                    END_DATE:'',
                    COLUMN_NAME: undefined,
                  };
  }
  initArrays();

  $scope.viewToggles = { what:true,
                         sum: true,
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
      url: "../../cgi-bin/datadownlow/api",
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

  $scope.checkData = true;

  $scope.destroy = function() {
    $scope.dtInstance.DataTable.ngDestroy();
    var i, ths = document.querySelectorAll('#main-table th');
       for (i=0;i<ths.length;i++) {
          ths[i].removeAttribute('style'); 
       }
    }

 
  $scope.getData = function (){
    $scope.showTable = true;
    // console.log($scope.data.COLUMN_NAME);
    if(typeof $scope.data.COLUMN_NAME != 'undefined' && $scope.data.COLUMN_NAME.length > 0){
      $scope.data.type = 'sum';
    } else {
      $scope.data.type = 'filter';
    }
    console.log($scope.data);
    
    var postData = JSON.stringify($scope.data);
    $http({
      method: "POST",
      url: "../../cgi-bin/datadownlow/api",
      data: "data=" + postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function(response) {
        $scope.columnsReady = false;
        $scope.fileName = response.data;
        $http({
          method: "POST",
          url: $scope.fileName
        }).then(function(response) {
          // trying this http://plnkr.co/edit/TzBaaZ2Msd9WchfLDLkN?p=preview
          var data = undefined;
          data = $.csv.toObjects(response.data);
          var sample = data[0], dtColumns = []
          
          for (var key in sample) {
            dtColumns.push(
              DTColumnBuilder.newColumn(key).withTitle(key)
            );
          }
          console.log(dtColumns);
          $scope.dtColumns = undefined;
          $scope.dtOptions = undefined;
          // clear any table
          if(typeof $scope.dtInstance.DataTable != 'undefined'){
            // $scope.dtInstance.DataTable.destroy();
            $scope.destroy();
          }
          
          $scope.dtColumns = dtColumns
          $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('data', data)
            .withOption('dataSrc', '')          
     
          // angular.element('#main-table').attr('datatable', '')
          // $compile(angular.element('#main-table'))($scope)

          $scope.columnsReady = true;

          $scope.checkData = false;
          d3.selectAll("svg").remove();
          if(typeof $scope.data.COLUMN_NAME !== "undefined" ) {
            
            $scope.vizImplemented = false;
            buildChart(data);
          } else {
            $scope.vizImplemented = true;
          }
          
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

  // $scope.tableColumns = [];
  // function getColumns(object){
  //   $scope.tableColumns = [];
  //   Object.keys(object).forEach(function(key) {
  //           $scope.tableColumns.push(key);
  //   });   
  // }

  // visualization
  function renderGraph(){
        $http({
            method: "POST",
            url: $scope.fileName
        }).then(function(response) {
            $scope.testdata = $.csv.toObjects(response.data);
            console.log($scope.testdata);

            buildChart();
        });
    }

    function ObjectLength( object ) {
        var length = 0;
        for( var key in object ) {
            if( object.hasOwnProperty(key) ) {
                ++length;
            }
        }
        return length;
    };


    function getLabel(object){
        for (var key in object[0]){
            if(key == 'COUNT'){
                continue;
            } else {
                return key;
            }
        }
    }

    function buildChart(data){
        const w = 800;
        const h = 500;

        const padding = 60;
        // width of space around bars, will be a minimum, can 
        // be up to 1 px more because of floor lower
        const barPadding = 5;

        // get number of elements in object
        const objLen = ObjectLength(data);

        // determine width of bars and bars plus space
        const barSpace = Math.floor((w - (padding + barPadding) ) / objLen);
        const barWidth = barSpace - barPadding;

        // get label of x axis
        const xLabel = getLabel(data);

        // set label of y axis
        const yLabel = "Count of Incidents";
      
        var ymax = d3.max(data, function(d) { return +d.COUNT;});

        const yScale = d3.scaleLinear() 
                         .domain([0, ymax])
                         .range([h - padding, padding ]);

        const yAxis = d3.axisLeft(yScale);
        
        const svg = d3.select("#chart")
                      .append("svg")
                      .attr("width", w)
                      .attr("height", h);

        // new stuff
        var xScale = d3.scaleBand()
          .range([padding, w])
          .domain(data.map(function(d) { return d[xLabel]; }))
          .padding(0.1);

        svg.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function (d){ return xScale(d[xLabel]); })
          .attr("y", (d, i) => yScale(d.COUNT) )
          .attr("width", xScale.bandwidth())
          .attr("height", (d, i) => h - yScale(d.COUNT) - 60)
          .attr("fill", "navy")
          .append("title")
          .text((d) => d[xLabel]);

        svg.append("g")
          .attr("transform", "translate(" + xScale.bandwidth()/2 + " ," + (h - padding) + ")")
          .call(d3.axisBottom(xScale))
          .selectAll("text")  
          .attr("dx", "-1.0304em")
          .attr("dy", "0.88em")
          .style("text-anchor", "start")
          .attr("transform", "rotate(45)" );

        // add y axis
        svg.append("g")
           .attr("transform", "translate(" + padding + ",0)")
           .call(yAxis);

        // text label for the chart
        svg.append("text")             
            .attr("x",padding + (w-padding)/2)
            .attr("y",20)
            .style("font-size", "16px") 
            .style("text-anchor", "middle")
            .text("Number of Hate Crimes by " + xLabel);   
    }

      



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