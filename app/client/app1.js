// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Parsel page
	$("#all_parsels").hide();

	$("#error_query_all").hide();

	$("#history_header").hide();
	$("#parsel_history_header").hide();
	$("#error_parsel_history").hide();
	$("#parsel_history").hide();

	$("#all_users").hide();

	$("#error_add_group").hide();
	$("#success_add_group").hide();

	$("#error_add_user").hide();
	$("#success_add_user").hide();

	$("#success_generated").hide();
	$("#error_generated").hide();
	

	$("#error_query").hide();
	$("#error_sender").hide();
	$("#error_query_id").hide();
	$("#error_query_student").hide();
	$("#error_prepare_delivery").hide();
	$("#error_pass_exam").hide();
	$("#error_student_record").hide();
	
	$("#error_id_delete_parsel").hide();
	$("#error_not_delivered").hide();
	$("#success_delete").hide();	


	$scope.queryAllParsels = function(){

		appFactory.queryAllParsels(function(data){

			$scope.query_all_parsels = data;

			if ($scope.query_all_parsels == "Error of query request"){
				console.log()
				$("#error_query_all").show();
				$("#all_parsels").hide();
				
			} else{
				$("#all_parsels").show();
				$("#error_query_all").hide();
			
			var array = [];
			for (var i = 0; i < data.length; i++){
				//parseInt(data[i].Key);
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return a.senderTS.localeCompare(b.senderTS);
			});
			$scope.all_parsels = array;
		  }
		});

		$("#history_parsel").hide();
		$("#query_parsel").hide();
		$("#sender_parsels").hide();
		$("#error_id_delete_parsel").hide();
	    $("#error_not_delivered").hide();
	    $("#success_delete").hide();	
	    $("#history_header").hide();
		$("#parsel_history_header").hide();
		$("#parsel_history").hide();

		$("#all_parsels").show();
	}

	$scope.getParselHistory = function(parsel){
		
		var parselId = parsel.Key;

		appFactory.parselHistory(parselId, function(data){
			
			if (data  == "No history for parsel"){
				console.log()
				$("#error_parsel_history").show();
				$("#parsel_history").hide();
			} else{
				$("#error_parsel_history").hide();
				$("#history_header").show();
				$("#parsel_history").show();
			
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
			$scope.parsel_history = array;
			$scope.selected_parsel = parsel;
	      }
		});

		$("#parsel_history_header").show();
		$("#parsel_history").show();
		$("#history_parsel_id").show();
	}
    

	$scope.queryAllUsers = function () {

		appFactory.queryAllUsers(function (data) {
			var array = [];
			for (var i = 0; i < data.length; i++) {
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
			}
			array.sort(function (a, b) {
				return a.groupName.localeCompare(b.groupName);
			});
			$scope.all_users = array;
			$("#all_users").show();
		});
	}
	
	$scope.deleteParsel = function (parsel) {
	

		var parselId = parsel.Key;

		appFactory.deleteParsel(parselId, function (data) {

			$scope.delete_parsel = data;
			
			$("#error_id_delete_parsel").hide();
			$("#error_not_delivered").hide();
			$("#success_delete").show();

			if ($scope.delete_parsel == "Error: Parsel not found") {
				$("#error_id_delete_parsel").show();
				$("#error_not_delivered").hide();
				$("#success_delete").hide();
			
			} else if ($scope.delete_parsel == "Error: Not delivered") {
				$("#error_id_delete_parsel").hide();
				$("#error_not_delivered").show();
				$("#success_delete").hide();
		    	
        	} 
		});
	}
	
});


// Angular Factory
app.factory('appFactory', function ($http) {

	var factory = {};

	factory.queryAllParsels = function (callback) {

		$http.get('/get_all_parsels/').success(function (output) {
			callback(output)
		});
	}

	factory.parselHistory = function(parselId, callback){
    	$http.get('/parsel_history/'+parselId).success(function(output){
			callback(output)
		});
	}

	factory.deleteParsel = function(parselId, callback){
    	$http.get('/delete_parsel/'+parselId).success(function(output){
			callback(output)
		});
	}

	return factory;
});
