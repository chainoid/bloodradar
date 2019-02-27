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
	

	$("#new_client_button_panel").show();
	$("#add_client_panel").hide();
	$("#success_add_client").hide();
	$("#success_update_client").hide();

	$("#client_sent_parsels").hide();
	$("#error_no_sent_data_found").hide();

	$("#client_rec_parsels").hide();
	$("#error_no_rec_data_found").hide();

	$("#error_client_history").hide();
	$("#header_history").hide();
	$("#client_history_header").hide();
	$("#client_history").hide();

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
				$("#client_history_header").hide();
				$("#client_history").hide();
				$("#success_add_client").hide();
				$("#success_update_client").hide();

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


	$scope.queryClientsByRange = function () {

		appFactory.queryClientsByRange($scope.range, function (data) {


			if (data  == "Error: No data found") {
				console.log()
				$("#error_query_range").show();
				$("#ranged_clients").hide();
				
			} else{
				$("#ranged_clients").show();
				$("#error_query_range").hide();
				$("#header_history").hide();
				$("#client_history_header").hide();
				$("#client_history").hide();
				$("#success_add_client").hide();
				$("#success_update_client").hide();

			var array = [];
			for (var i = 0; i < data.length; i++) {
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.name.localeCompare(b.name);
			});
			$scope.ranged_clients = array;
		  }
		});
	}


	$scope.beforeAddClient = function () {
		
		$("#addClientLabel").show();
		$("#updateClientLabel").hide();
		$("#new_client_button_panel").hide();
		$("#add_client_panel").show();
		$("#addClientId").show();
		$("#updateClientId").hide();

		$scope.client = null;
	}

	$scope.cancelAddClient = function () {

		$("#new_client_button_panel").show();
		$("#add_client_panel").hide();

		$("#success_add_client").hide();
		$("#success_update_client").hide();
	}

    $scope.addClient = function () {

		appFactory.addClient($scope.client, function(data){
			$scope.accepted_client_id = data;
			$("#success_add_client").show();
			$("#add_client_panel").hide();

			$("#new_client_button_panel").show();
		});
	}


	$scope.beforeUpdateClient = function (client) {
		
		$("#addClientLabel").hide();
		$("#updateClientLabel").show();
		$("#new_client_button_panel").hide();

		$("#addClientId").hide();
		$("#updateClientId").show();
		
		$("#add_client_panel").show();

		$scope.client = client;
	}

	$scope.updateClient = function ()  {

		appFactory.updateClient($scope.client, function(data){
			$scope.accepted_client_id = data;
			$("#new_client_button_panel").show();
			$("#success_update_client").show();
			$("#add_client_panel").hide();
		});
	}


    $scope.getClientSentParsels = function (client) {

		var name = client.name;

		appFactory.clientSentParsels(name, function (data) {
	
			if (data  == "Error: No data found"){
				$("#error_no_sent_data_found").show();
				$("#client_sent_parsels").hide();
				$("#client_rec_parsels").hide();
				$("#error_no_rec_data_found").hide();
				
			} else{
				$("#client_sent_parsels").show();
				$("#client_rec_parsels").hide();
				$("#error_no_sent_data_found").hide();

			var array = [];
			for (var i = 0; i < data.length; i++) {
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.senderTS.localeCompare(b.senderTS);
			});
			$scope.client_sent_parsels = array;
		  }
		});
	}

	 $scope.getClientReceivedParsels = function (client) {

		var name = client.name;

	 	appFactory.clientReceivedParsels(name, function (data) {

			if (data  == "Error: No data found"){
				$("#error_no_rec_data_found").show();
				$("#error_no_sent_data_found").hide();
				$("#client_sent_parsels").hide();
				$("#client_rec_parsels").hide();
				
			} else{
				$("#error_no_rec_data_found").hide();
				$("#error_no_sent_data_found").hide();
				$("#client_sent_parsels").hide();
				$("#client_rec_parsels").show();
			
			  var array = [];
			  for (var i = 0; i < data.length; i++) {
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.senderTS.localeCompare(b.senderTS);
			});
			$scope.client_rec_parsels = array;
			} 
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

	factory.addClient = function (data, callback) {

		var client = data.name + "-" + data.address + "-" + data.phone + "-" + data.branchId;

		$http.get('/add_client/' + client).success(function (output) {
			callback(output)
		});
	}

	factory.updateClient = function (data, callback) {

		var client = data.Key + "-" + data.name + "-" + data.address + "-" + data.phone + "-" + data.branchId;

		$http.get('/update_client/' + client).success(function (output) {
			callback(output)
		});
	}


	factory.clientSentParsels = function (name, callback) {
		
		$http.get('/get_sent_parsels/' + name).success(function (output) {
			callback(output)
		});
	}

	factory.clientReceivedParsels = function (name, callback) {

	 	$http.get('/get_received_parsels/' + name).success(function (output) {
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
