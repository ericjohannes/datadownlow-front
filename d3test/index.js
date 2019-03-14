var app = angular.module('app', []);
app.controller('main', function($scope, $http) {
    $scope.fileName = 'testdata.csv';
    $scope.testdata = undefined;

    $scope.changeData = function (){
        $scope.fileName = 'testdata2.csv';
        d3.selectAll("svg").remove();
        renderGraph();
    }

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

    function buildChart(){
        const w = 800;
        const h = 500;

        const padding = 60;
        // width of space around bars, will be a minimum, can 
        // be up to 1 px more because of floor lower
        const barPadding = 5;

        // get number of elements in object
        const objLen = ObjectLength($scope.testdata);

        // determine width of bars and bars plus space
        const barSpace = Math.floor((w - (padding + barPadding) ) / objLen);
        const barWidth = barSpace - barPadding;

        // get label of x axis
        const xLabel = getLabel($scope.testdata);

        // set label of y axis
        const yLabel = "Count of Incidents";
      
        var ymax = d3.max($scope.testdata, function(d) { return +d.COUNT;});

        const yScale = d3.scaleLinear() 
                         .domain([0, ymax])
                         .range([h - padding, padding ]);

        const yAxis = d3.axisLeft(yScale);
        
        const svg = d3.select("body")
                      .append("svg")
                      .attr("width", w)
                      .attr("height", h);

        // new stuff
        var xScale = d3.scaleBand()
            .range([padding, w])
            .domain($scope.testdata.map(function(d) { return d[xLabel]; }))
            .padding(0.1);

        // var test = $scope.testdata.map(function(d) { return d[xLabel]; });
        // console.log(test);

         // var g = svg.append("g")
         //    .attr("transform", "translate(" + padding + ",0)");

        // var xAxisG = g.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + h - padding + ")");

        

        // var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
        //     .outerTickSize(0);

        // xScale.domain($scope.testdata.map( function (d){ return d[xLabel]; }));

        // xAxisG
        //   .call(xAxis)
        //   .selectAll("text")  
        //   .attr("dx", "-1.0304em")
        //   .attr("dy", "0.88em")
        //   .attr("transform", "rotate(-20)" );

         svg.selectAll("rect")
            .data($scope.testdata)
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
;
        // end new stuff

        // svg.selectAll("rect")
        //    .data($scope.testdata)
        //    .enter()
        //    .append("rect")
        //    .attr("x", (d, i) => padding + barPadding + i * barSpace)
        //    .attr("y", (d, i) => yScale(d.COUNT) )
        //    .attr("width", barWidth)
        //    .attr("height", (d, i) => h - yScale(d.COUNT) - 60)
        //    .attr("fill", "navy")
        //    .append("title")
        //    .text((d) => d[xLabel]);

        // svg.selectAll("text")
        //     .data($scope.testdata)
        //     .enter()
        //     .append("text")
        //     .text((d) => d[xLabel])
        //     .attr("x", (d, i) => padding + barPadding + i * barSpace)
        //     .attr("y", (d, i) => h - padding/2 )
        //     .attr("class", "bar-label");
            // .style("text-anchor", "end")
            // .attr("transform", "rotate(-65)");
       





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

        // text label for the y axis
        // svg.append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 0 - padding)
        //     .attr("x",0 - (h / 2))
        //     .attr("dy", "1em")
        //     .style("text-anchor", "middle")
        //     .text(yLabel);    
    }

    renderGraph();

});