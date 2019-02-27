// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Create parsel order
	$("#error_serder_receiver_id").hide();
	$("#success_create_order").hide();

	// Accept parsel
	$("#error_accept_parsel_id").hide();
	$("#error_accept_parsel_done").hide();
	$("#success_accepted").hide();


    // Switch courier
	$("#error_switch_courier").hide();
	$("#success_switch_courier").hide();


    // Delivery parsel
	$("#error_parsel_id").hide();
	$("#error_delivered").hide();
	$("#success_delivery").hide();


	$scope.createParselOrder = function () {

		appFactory.createParselOrder($scope.order, function (data) {
			
			if (data == "Cannot find sender/receiver") {
				$("#error_serder_receiver_id").show();
				$("#success_create_order").hide();
			} else {
				$("#error_serder_receiver_id").hide();
				$("#success_create_order").show();
			}

			$scope.create_order_result = data;
		});
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
	
		
	factory.createParselOrder = function (data, callback) {

		var order = data.senderId + "-" + data.receiverId + "-" + "-" + "-";

		$http.get('/create_parsel_order/' + order).success(function (output) {
			callback(output)
		});
	}

    factory.acceptParsel = function (input, callback) {

		var params = input.parselId + "-" + input.branchId;

		$http.get('/accept_parsel/' + params).success(function (output) {
			callback(output)
		});
	}

	factory.switchCourier = function (input, callback) {

		var params = input.parselId + "-" + input.courierId;

		$http.get('/switch_courier/' + params).success(function (output) {
			callback(output)
		});
	}
	
	factory.deliveryParsel = function (delivery, callback) {

		var params = delivery.parselId;

		$http.get('/delivery_parsel/' + params).success(function (output) {
			callback(output)
		});
	}

	return factory;
});
