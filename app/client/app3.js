// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {


	// Blood bank page
	$("#selected_bpacks").hide();

	$("#error_no_data_found").hide();
	$("#error_query_btype").hide();

	// History
	$("#history_header").hide();
	$("#bpack_history_header").hide();
	$("#error_bpack_history").hide();
	$("#bpack_history").hide();
	$("#bpack_history_footer").hide();


	// Change status
	$("#change_status_panel").hide();	


	// Change holder
	$("#change_holder_panel").hide();
	$("#error_bpack_id").hide();

    // Delete blood pack
	$("#error_id_delete_bpack").hide();
	$("#success_delete").hide();	
	$("#success_change_status").hide();

	// // Create parsel order
	// $("#error_serder_receiver_id").hide();
	// $("#success_create_order").hide();

	// // Accept parsel
	
	// $("#error_accept_parsel_done").hide();
	// $("#success_accepted").hide();


    // // Switch courier
	// $("#error_switch_courier").hide();
	// $("#success_switch_courier").hide();


    // // Delivery parsel
	// $("#error_parsel_id").hide();
	// $("#error_delivered").hide();
	// $("#success_delivery").hide();


	$scope.queryBpackByBtype = function(){

		appFactory.queryBpackByBtype($scope.queryParams, function(data){

			
			if (data == "Error: No data found"){
				console.log()
				$("#error_no data_found").show();
				$("#selected_bpacks").hide();
				
			} else{
				$("#selected_bpacks").show();
				$("#error_query_all").hide();
			
			var array = [];
			for (var i = 0; i < data.length; i++){
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.donationTS.localeCompare(b.donationTS);
			});
			$scope.selected_bpacks = array;
		  }
	});

	}


    $scope.getBpackHistory = function(bpack){
		
		var bpackId = bpack.Key;

		appFactory.bpackHistory(bpackId, function(data){
			
			if (data  == "No history for bpack"){
				console.log()
				$("#error_bpack_history").show();
				$("#bpack_history").hide();
			} else{
				$("#error_bpack_history").hide();
				$("#history_header").show();
				$("#bpack_history").show();
			
			var array = [];
			for (var i = 0; i < data.length; i++){
				
				data[i].Record.TxId = data[i].TxId;
				data[i].Record.TxTS = data[i].TxTS;
				data[i].Record.IsDelete = data[i].IsDelete;
			
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.TxTS.localeCompare(b.TxTS);
			});
			$scope.bpack_history = array;
			$scope.selected_bpack = bpack;
	      }
		});
		
		$("#bpack_history_header").show();
		$("#bpack_history").show();
		$("#history_parsel_id").show();
		$("#bpack_history_footer").show();
	}


	$scope.hideBpackHistory = function () {

		$("#history_header").hide();
		$("#bpack_history_header").hide();
		$("#bpack_history").hide();
		$("#history_parsel_id").hide();
		$("#bpack_history_footer").hide();
	}


	$scope.beforeChangeBpackStatus = function (bpack) {

		var params ={};

		params.bpackId = bpack.Key;
		params.status  = bpack.status;
		params.holder  = bpack.holder;
		params.location  = bpack.location;

		$scope.statusParams = params;

		$("#change_status_panel").show();
	}

	$scope.changeBpackStatus = function (statusParams) {

		appFactory.changeBpackStatus($scope.statusParams, function (data) {

			$scope.change_status_result = data;
			
			$("#error_bpack_id").hide();
			$("#error_accept_parsel_done").hide();
			$("#success_change_status").show();

			if ($scope.change_status_result == "Error: Parsel not found") {
				$("#error_bpack_id").show();
				$("#error_accept_parsel_done").hide();
				$("#success_change_status").hide();
			

			} else if ($scope.change_status_result == "Error: Already accepted") {
				$("#error_bpack_id").hide();
				$("#error_accept_parsel_done").show();
				$("#success_change_status").hide();
		    }					
		});
	}

	$scope.cancelChangeStatus = function () {

		$("#change_status_panel").hide();
		$("#error_bpack_id").hide();
		$("#success_change_status").hide();
	}


	// $scope.beforeChangeBpackHolder = function (bpack) {

	// 	var params ={};
	// 	params.bpackId = bpack.Key;
	// 	params.status  = bpack.status;

	// 	$scope.holderParams = params;

	// 	$("#change_holder_panel").show();
	// }


	// $scope.changeBpackHolder = function (holderParams) {

	// 	appFactory.changeBpackHolder($scope.switch, function (data) {

	// 		if (data == "Could not locate parsel") {
	// 			$("#error_switch_courier").show();
	// 			$("#success_switch_courier").hide();
	// 		} else {
	// 			$("#error_switch_courier").hide();
	// 			$("#success_switch_courier").show();
	// 		}

	// 		$scope.switch_courier_result = data;
	// 	});
	// }
	
	// $scope.cancelChangeHolder = function () {

	// 	$("#change_holder_panel").hide();
	// }

});


// Angular Factory
app.factory('appFactory', function ($http) {

	var factory = {};
	
	factory.queryBpackByBtype = function (queryParams, callback) {


		var params = queryParams.btype + "-" + queryParams.status;

		$http.get('/query_bpack_by_btype/'+params).success(function (output) {
			callback(output)
		});
	}

	factory.bpackHistory = function(bpackId, callback){
    	$http.get('/bpack_history/'+bpackId).success(function(output){
			callback(output)
		});
	}


    factory.changeBpackStatus = function (statusParams, callback) {

		var params = statusParams.bpackId + "-" + statusParams.status + "-" + statusParams.holder + "-" + statusParams.location;

		$http.get('/change_bpack_status/' + params).success(function (output) {
			callback(output)
		});
	}

	// factory.changeBpackHolder = function (input, callback) {

	// 	var params = input.bpacklId + "-" + input.holder;

	// 	$http.get('/change_bpack_holder/' + params).success(function (output) {
	// 		callback(output)
	// 	});
	// }

	return factory;
});
