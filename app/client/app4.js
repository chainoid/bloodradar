// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Client's page
	$("#error_query_donors_by_type").hide();
	$("#donors_by_btype").hide();


	$("#error_query_range").hide();
	$("#ranged_clients").hide();
	

	$("#new_donor_button_panel").show();
	$("#add_donor_panel").hide();
	$("#success_add_donor").hide();
	$("#success_update_donor").hide();

	
	$("#error_donor_history").hide();
	$("#header_history").hide();
	$("#donor_history_header").hide();
	$("#donor_history").hide();

	$scope.queryDonorsByBtype = function () {

		appFactory.queryDonorsByBtype($scope.btype, function (data) {

			if (data == "Error: No data found"){
				console.log()
				$("#error_query_donors_by_type").show();
				$("#donors_by_btype").hide();
                
                $scope.donors_by_btype = null;

			} else{
				$("#donors_by_btype").show();
				$("#error_query_donors_by_type").hide();
				$("#header_history").hide();
				$("#donor_history_header").hide();
				$("#donor_history").hide();
				$("#success_add_donor").hide();
				$("#success_update_donor").hide();

			var array = [];
			for (var i = 0; i < data.length; i++) {
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.name.localeCompare(b.name);
			});
			$scope.donors_by_btype = array;
		  }
		});
	}


	// $scope.queryClientsByRange = function () {

	// 	appFactory.queryClientsByRange($scope.range, function (data) {


	// 		if (data  == "Error: No data found") {
	// 			console.log()
	// 			$("#error_query_range").show();
	// 			$("#ranged_clients").hide();
				
	// 		} else{
	// 			$("#ranged_clients").show();
	// 			$("#error_query_range").hide();
	// 			$("#header_history").hide();
	// 			$("#client_history_header").hide();
	// 			$("#client_history").hide();
	// 			$("#success_add_donor").hide();
	// 			$("#success_update_donor").hide();

	// 		var array = [];
	// 		for (var i = 0; i < data.length; i++) {
	// 			data[i].Record.Key = data[i].Key;
	// 			array.push(data[i].Record);
	// 		}
	// 		array.sort(function(a, b) {
	// 		    return a.name.localeCompare(b.name);
	// 		});
	// 		$scope.ranged_clients = array;
	// 	  }
	// 	});
	// }


	$scope.beforeAddDonor = function () {
		
		$("#addDonorLabel").show();
		$("#updateDonorLabel").hide();
		$("#new_donor_button_panel").hide();
		$("#add_donor_panel").show();
		$("#addDonorId").show();
		$("#updateDonorId").hide();

		$scope.donor = null;
	}

	$scope.cancelAddDonor = function () {

		$("#new_donor_button_panel").show();
		$("#add_donor_panel").hide();

		$("#success_add_donor").hide();
		$("#success_update_donor").hide();
	}

  $scope.addDonor = function () {

		appFactory.addDonor($scope.donor, function(data){
			$scope.accepted_donor_id = data;
			$("#success_add_donor").show();
			$("#add_donor_panel").hide();

			$("#new_donor_button_panel").show();
		});
	}

	$scope.beforeUpdateDonor = function (donor) {
		
		$("#addDonorLabel").hide();
		$("#updateDonorLabel").show();
		$("#new_donor_button_panel").hide();

		$("#addDonorId").hide();
		$("#updateDonorId").show();
		
		$("#add_donor_panel").show();

		$scope.donor = donor;
	}

	$scope.updateDonor = function ()  {

		appFactory.updateDonor($scope.donor, function(data){
			$scope.accepted_donor_id = data;
			$("#new_donor_button_panel").show();
			$("#success_update_donor").show();
			$("#add_donor_panel").hide();
		});
	}
 

	$scope.getDonorHistory = function (donor) {

		var donorKey = donor.Key;

	 	appFactory.donorHistory(donorKey, function (data) {

			if (data  == "Error: No data found"){
				$("#error_no_sent_data_found").hide();
				
				$("#header_history").hide();
				$("#error_donor_history").show();
				$("#donor_history_header").hide();
				$("#donor_history").hide();
								
			} else{
								
				$("#error_donor_history").hide();
				$("#header_history").show();
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


	$scope.getUserRecord = function () {
		
		var id = $scope.id;

		appFactory.getUserRecord(id, function(data){

			$scope.user_record = data;

			if ($scope.user_record == "User record not found"){
				console.log()
				$("#error_user_record").show();
				$("#user_record").hide();
				$("#user_record2").hide();
				
			} else{
				$("#error_user_record").hide();
				$("#user_record").show();
				$("#user_record2").show();
			}
		});
	}


});


// Angular Factory
app.factory('appFactory', function ($http) {

	var factory = {};

	factory.queryDonorsByBtype = function (data, callback) {

        var btype = data;

		$http.get('/get_donors_by_btype/' + btype).success(function (output) {
			callback(output)
		});
	}

	factory.queryClientsByRange = function (data, callback) {

		var range = data.from + "-" + data.to;

		$http.get('/get_clients_by_range/' + range).success(function (output) {
			callback(output)
		});
	}

	factory.addDonor = function (data, callback) {

		var donor = data.name + "-" + data.address + "-" + data.phone + "-" + data.ssn + "-" + data.age + "-" + data.sex + "-" + data.btype;

		$http.get('/add_donor/' + donor).success(function (output) {
			callback(output)
		});
	}

	factory.updateDonor = function (data, callback) {

		var donor = data.Key+"-"+ data.name + "-" + data.address + "-" + data.phone + "-" + data.age;

		$http.get('/update_donor/' + donor).success(function (output) {
			callback(output)
		});
	}
	

	factory.donorHistory = function (donorKey, callback) {

		$http.get('/donor_history/' + donorKey).success(function (output) {
			callback(output)
		});
    }

	factory.getUserRecord = function (id, callback) {
		$http.get('/get_user_record/' + id).success(function (output) {
			callback(output)
		});
	}

	return factory;
});
