// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Donor profile
	$("#error_donor_profile").hide();
	$("#donor_profile").hide();

	// Donor history
	$("#header_history").hide();
	$("#error_donor_history").hide();
	$("#donor_history").hide();

	// Donor activity
	$("#header_activity").hide();
	$("#error_donor_record").hide();
	$("#donor_activity").hide();

    $scope.getDonorById = function () {
		
		var donorId = $scope.donorId;

		appFactory.getDonorById(donorId, function(data){
          	
			if (data == "Donor record not found"){
		  		console.log()
			  	$("#error_donor_profile").show();
				  $("#donor_profile").hide();
			} else{
				$("#error_donor_profile").hide();
				$("#donor_profile").show();
				$("#header_history").show();
				$("#header_activity").show();
				$scope.selected_donor = data;
			}
		});
	}

	$scope.getDonorHistory = function (donorKey) {

		appFactory.donorHistory(donorKey, function (data) {

			if (data  == "Error: No data found"){
				$("#error_no_sent_data_found").hide();
				$("#error_donor_history").show();
				$("#donor_history_header").hide();
				$("#donor_history").hide();
								
			} else{
				$("#error_donor_history").hide();					
				$("#donor_history_header").show();
				$("#donor_history").show();
			
			  var array = [];
			  for (var i = 0; i < data.length; i++) {

				// History fields added to record 
				data[i].Record.TxId = data[i].TxId;
				data[i].Record.TxTS = data[i].TxTS;
				data[i].Record.IsDelete = data[i].IsDelete;

				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.TxTS.localeCompare(b.TxTS);
			});
			$scope.donor_history = array;
			$scope.selected_donor = donor;
			} 
		});
	}


	$scope.getDonorActivity = function () {
		
		var donorId = $scope.donorId;

		appFactory.getDonorActivity(donorId, function(data){

			if (data == "Error: No data found"){
				console.log()
				$("#error_donor_record").show();
				$("#donor_activity").hide();
			
				
			} else{

			$("#error_donor_record").hide();
				$("#donor_activity").show();

			  var array = [];

			  for (var i = 0; i < data.length; i++){
			  	data[i].Record.Key = data[i].Key;
				  array.push(data[i].Record);
				}
				
			  array.sort(function(a, b) {
			    return a.donationTS.localeCompare(b.donationTS);
			  }
			);
			$scope.donor_activity = array;
			
			}
		});
	}

});


// Angular Factory
app.factory('appFactory', function ($http) {

	var factory = {};
    
    
    factory.getDonorById = function (donorId, callback) {

		$http.get('/get_donor_by_id/' + donorId).success(function (output) {
			callback(output)
		});
    }


	factory.donorHistory = function (donorKey, callback) {

		$http.get('/donor_history/' + donorKey).success(function (output) {
			callback(output)
		});
    }

	factory.getDonorActivity = function (donorId, callback) {
		$http.get('/get_donor_activity/' + donorId).success(function (output) {
			callback(output)
		});
	}

	return factory;
});
