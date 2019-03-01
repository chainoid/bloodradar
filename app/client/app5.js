// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Donor profile
	$("#error_query_donors_by_type").hide();
	$("#donor_profile").hide();


	$("#error_query_range").hide();
	$("#donor_activity").hide();
	

	//$("#new_donor_button_panel").show();
	//$("#add_donor_panel").hide();
	//$("#success_add_donor").hide();
	//$("#success_update_donor").hide();

	
	//$("#error_donor_history").hide();
	//$("#header_history").show();
	//$("#donor_history_header").hide();
	//$("#donor_history").hide();


    $scope.getDonorById = function () {
		
		var donorId = $scope.donorId;

		appFactory.getDonorById(donorId, function(data){

          	$scope.selected_donor = data;

			if ($scope.selected_donor == "Donor record not found"){
				console.log()
				//$("#error_user_record").show();
				$("#donor_profile").hide();
				//$("#user_record2").hide();
				
			} else{
				//$("#error_user_record").hide();
				$("#donor_profile").show();
				//$("#user_record2").show();
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


	$scope.getDonorRecord = function () {
		
		var id = $scope.id;

		appFactory.getDonorRecord(id, function(data){

			$scope.user_record = data;

			if ($scope.user_record == "User record not found"){
				console.log()
				$("#error_user_record").show();
				$("#donor_activity").hide();
				$("#user_record2").hide();
				
			} else{
				$("#error_user_record").hide();
				$("#donor_activity").show();
				$("#user_record2").show();
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

	factory.getDonorRecord = function (id, callback) {
		$http.get('/get_user_record/' + id).success(function (output) {
			callback(output)
		});
	}

	return factory;
});
