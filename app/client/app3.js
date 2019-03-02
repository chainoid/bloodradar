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





    // Delete blood pack
	$("#error_id_delete_bpack").hide();
	$("#success_delete").hide();	


	// // Create parsel order
	// $("#error_serder_receiver_id").hide();
	// $("#success_create_order").hide();

	// // Accept parsel
	// $("#error_accept_parsel_id").hide();
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


	$scope.acceptParsel = function () {

		appFactory.acceptParsel($scope.accept, function (data) {

			$scope.accepted_parsel_result = data;
			
			$("#error_accept_parsel_id").hide();
			$("#error_accept_parsel_done").hide();
			$("#success_accepted").show();

			if ($scope.accepted_parsel_result == "Error: Parsel not found") {
				$("#error_accept_parsel_id").show();
				$("#error_accept_parsel_done").hide();
				$("#success_accepted").hide();
			

			} else if ($scope.accepted_parsel_result == "Error: Already accepted") {
				$("#error_accept_parsel_id").hide();
				$("#error_accept_parsel_done").show();
				$("#success_accepted").hide();
		    }					
		});
	}

	$scope.switchCourier = function () {

		appFactory.switchCourier($scope.switch, function (data) {

			if (data == "Could not locate parsel") {
				$("#error_switch_courier").show();
				$("#success_switch_courier").hide();
			} else {
				$("#error_switch_courier").hide();
				$("#success_switch_courier").show();
			}

			$scope.switch_courier_result = data;
		});
	}

	
	$scope.deliveryParsel = function () {
	

		appFactory.deliveryParsel($scope.delivery, function (data) {

			$scope.delivery_parsel = data;
			
			$("#error_parsel_id").hide();
			$("#error_delivered").hide();
			$("#success_delivery").show();

			if ($scope.delivery_parsel == "Error: Parsel not found") {
				$("#error_parsel_id").show();
				$("#error_delivered").hide();
				$("#success_delivery").hide();
			

			} else if ($scope.delivery_parsel == "Error: Already delivered") {
				$("#error_parsel_id").hide();
				$("#error_delivered").show();
				$("#success_delivery").hide();
		    	
        	} 
		});
	}

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


    // factory.acceptParsel = function (input, callback) {

	// 	var params = input.parselId + "-" + input.branchId;

	// 	$http.get('/accept_parsel/' + params).success(function (output) {
	// 		callback(output)
	// 	});
	// }

	// factory.switchCourier = function (input, callback) {

	// 	var params = input.parselId + "-" + input.courierId;

	// 	$http.get('/switch_courier/' + params).success(function (output) {
	// 		callback(output)
	// 	});
	// }
	
	// factory.deliveryParsel = function (delivery, callback) {

	// 	var params = delivery.parselId;

	// 	$http.get('/delivery_parsel/' + params).success(function (output) {
	// 		callback(output)
	// 	});
	// }

	return factory;
});
