// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function ($scope, appFactory) {

	// Hospital page
	$("#selected_bpacks").hide();

	$("#hospital_no_data_found").hide();
	$("#error_query_btype").hide();

	$("#history_header").hide();
	$("#bpack_history_header").hide();
	$("#error_bpack_history").hide();
	$("#bpack_history").hide();

	$("#error_id_transfuse_bpack").hide();
	$("#error_transfuse_bpack").hide();
	$("#success_transfuse").hide();
	

	$("#error_id_delete_bpack").hide();
	$("#success_delete").hide();	


	$scope.queryBpackByBtype = function(){

		appFactory.queryBpackByBtype($scope.queryParams, function(data){

			
			if (data == "Error: No data found"){
				console.log()
				$("#hospital_no_data_found").show();
				$("#selected_bpacks").hide();
				$("#history_header").hide();
				$("#bpack_history_header").hide();
		        $("#bpack_history").hide();
		        $("#history_parsel_id").hide();
				
			} else{
				$("#selected_bpacks").show();
				$("#hospital_no_data_found").hide();
				$("#history_header").hide();
				$("#bpack_history_header").hide();
		        $("#bpack_history").hide();
		        $("#history_parsel_id").hide();
			
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
	   
	    $("#success_delete").hide();	
	    //$("#bpack_history_header").show();
		//$("#bpack_history").show();
		//$("#success_transfuse").hide();
	}

	$scope.generateIdBarcode = function (bpack) {

		var id = bpack.Key;
		JsBarcode("#barcode", id);
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

		$("#success_transfuse").hide();
		$("#bpack_history_header").show();
		$("#bpack_history").show();
		$("#history_parsel_id").show();
	}
    

	$scope.doTransfuse = function (bpack) {
	
		var bpackId = bpack.Key;

		appFactory.doTransfuse(bpackId, function (data) {

			$scope.transfuse_result = data;
			
			$("#error_transfuse_bpack").hide();
			$("#error_id_transfuse_bpack").hide();
			$("#success_transfuse").show();

			if (data == "Error: Bpack not found") {
				$("#error_id_transfuse_bpack").show();
		    	$("#success_transfuse").hide();
			
			} else if (data == "Error: Incorrect status") {
				$("#error_transfuse_bpack").show();
				$("#success_transfuse").hide();
        	} 
		});
	}
	
	$scope.deleteBpack = function (bpack) {
	
		var bpackId = bpack.Key;

		appFactory.deleteBpack(bpackId, function (data) {

			$scope.delete_bpack = data;
			
			$("#error_id_delete_bpack").hide();
			$("#success_delete").show();
			$("#success_transfuse").hide();

			if (data == "Error: Bpack not found") {
				$("#error_id_delete_parsel").show();
		    	$("#success_delete").hide();
			
			} else if (data == "Error: Not delivered") {
				$("#error_id_delete_parsel").hide();
				$("#success_delete").hide();
		    	
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

	factory.doTransfuse = function(bpackId, callback){
    	$http.get('/do_transfuse/'+bpackId).success(function(output){
			callback(output)
		});
	}

	factory.deleteBpack = function(bpackId, callback){
    	$http.get('/delete_bpack/'+bpackId).success(function(output){
			callback(output)
		});
	}

	return factory;
});
