var app = angular.module('app', ['ngRows']);
app.directive('logCompile', function($rootScope) {
  $rootScope.log = "";

  return {
    controller: function($scope, $attrs) {
      $rootScope.log = $rootScope.log + ($attrs.logCompile + ' (controller)\n');
    },
    compile: function compile(element, attributes) {
      $rootScope.log = $rootScope.log + (attributes.logCompile + ' (compile)\n');
      return {
        pre: function preLink(scope, element, attributes) {
          $rootScope.log = $rootScope.log + (attributes.logCompile + ' (pre-link)\n');
        },
        post: function postLink(scope, element, attributes) {
          element.prepend(attributes.logCompile);
          $rootScope.log = $rootScope.log + (attributes.logCompile + ' (post-link)\n');
        }
      };
    }
  };
})

app.directive('terminate', function() {
  return {
    terminal: true
  };
});
// Controller
app.controller('main', function ($scope) {
  var vm = $scope;

  // Generate random name data for testing
  var firstNames = ['Alan', 'Alice', 'Amber', 'Amanda', 'Barney', 'Bobby', 'Bethany', 'Casey', 'Clayton', 'Cody', 'Dillon', 'Dianne', 'Edward', 'Ethan', 'Eleanor', 'Frank', 'Francene', 'Gary', 'George', 'Georgia', 'Helen', 'Harry', 'Isaac', 'Julia', 'Justin', 'Keith', 'Kathleen', 'Larry', 'Martin', 'Mary', 'Mark', 'Megan', 'Nathan', 'Oliver', 'Philip', 'Ray', 'Rebecca', 'Steve', 'Sara', 'Tina', 'Terry', 'Vince', 'Walter', 'Zeke'];
  var lastNames = ['Adams', 'Brown', 'Blevins', 'Clayton', 'Dixon', 'Edwards', 'Fitzgerald', 'Gray', 'Greene', 'Harris', 'Ibanez', 'Jensen', 'Jefferson', 'Johnson', 'Kennedy', 'Lewis', 'Lincoln', 'Martin', 'McGuire', 'Motz', 'Meyer', 'Newton', 'Penn', 'Richards', 'Russell', 'Smith', 'Stevens', 'Sweet', 'Turner', 'Thompson', 'Vick', 'Waters', 'White', 'Woods'];

  // Array of row objects to display in the table
  vm.names = [];

  for (var i = 1; i <= 100; i++) {
    vm.names.push({
      id: i,
      firstName: firstNames.randomElement(),
      lastName: lastNames.randomElement()
    });
  }
  
});

// Return a random element from an array
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
};