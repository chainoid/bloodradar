// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Blood camp page

	$("#donor_record").hide();


	$("#error_donor_record").hide();
	$("#ranged_clients").hide();
	
	$("#new_donation_button_panel").hide();
	$("#add_donation_panel").hide();
	$("#success_add_donation").hide();

		

  $scope.queryDonorData = function () {
		
		var donorId = $scope.donor.donorId;

		appFactory.queryDonorData(donorId, function(data){

			if ((data == "") || (data == "Error: No data found")){
				console.log()
				$("#error_donor_record").show();
				$("#donor_record").hide();
				$("#new_donation_button_panel").hide();
			} else{
				$("#error_donor_record").hide();
				$("#donor_record").show();
				$("#new_donation_button_panel").show();
				$scope.donor_record = data;
			}
		});
	}


	$scope.beforeAddDonation = function () {
				
	  var donation = {};
    
		donation.btype =   $scope.donor_record.btype;
		donation.donorId = $scope.donor.donorId;

		$scope.donation = donation;
		
		$("#new_donation_button_panel").hide();

		$("#add_donation_label").show();
		$("#add_donation_panel").show();
		$("#addClientId").show();
	}

	$scope.cancelAddDonation = function () {

		$("#new_donation_button_panel").show();
		$("#add_donation_panel").hide();

		$("#success_add_donation").hide();
	}
  	

	$scope.addDonation = function ()  {

		appFactory.addDonation($scope.donation, function(data){
			$scope.accepted_client_id = data;
			$("#new_client_button_panel").show();
			$("#success_add_donation").show();
			$("#add_client_panel").hide();
		});
	}
	

	$scope.getClientHistory = function (client) {

		var clientKey = client.Key;

	 	appFactory.clientHistory(clientKey, function (data) {

			if (data  == "Error: No data found"){
				$("#error_no_sent_data_found").hide();
				$("#client_sent_parsels").hide();
				$("#client_rec_parsels").hide();
				$("#header_history").hide();
				$("#error_client_history").show();
				$("#client_history_header").hide();
				$("#client_history").hide();
								
			} else{
				$("#error_no_rec_data_found").hide();
				$("#error_no_sent_data_found").hide();
				$("#client_sent_parsels").hide();
				$("#client_rec_parsels").hide();
				$("#client_rec_parsels").hide();
				$("#error_client_history").hide();
				$("#header_history").show();
				$("#client_history_header").show();
				$("#client_history").show();
			
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
			$scope.client_history = array;
			$scope.selected_client = client;
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


	factory.queryDonorData = function (donorId, callback) {
		
		$http.get('/get_donor_by_id/' + donorId).success(function (output) {
			callback(output)
		});
	}
	

	factory.queryClientsByRange = function (data, callback) {

		var range = data.from + "-" + data.to;

		$http.get('/get_clients_by_range/' + range).success(function (output) {
			callback(output)
		});
	}

	factory.addDonation = function (data, callback) {

		var donation = data.donorId + "-" + data.btype + "-" + data.amount + "-" + data.holder + "-" + data.location + "-" + data.desc;

		$http.get('/add_donation/' + donation).success(function (output) {
			callback(output)
		});
	}
	


	factory.clientHistory = function (clientKey, callback) {

		$http.get('/client_history/' + clientKey).success(function (output) {
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
