//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */

// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');

// Custom utils
const ledgerUtils  = require("./ledgerUtils.js");

module.exports = (function() {




// **  The Main functionality ** // 
return{
	

	get_donors_by_btype: function(req, res){

		console.log("getting donors by btype: ");

		var btype = req.params.btype;
		
		var queryDonorsByBtypeParams = {
			Btype:    btype
		};

		var model = GetRecordMapModel(queryDonorsByBtypeParams, 'donors', 'queryDonorsByBtype', 'donor-channel');

		ReadFromLedger(model, res);	    
	},


	query_bpack_by_btype: function(req, res){

		console.log("query bpacks by btype: ");

		var array = req.params.queryParams.split("-");
		
		var btype  = array[0];
		
		var status = array[1];

		var queryBpackByBtypeParams = {
			Btype:    btype,
			Status:   status
		};

		var model = GetRecordMapModel(queryBpackByBtypeParams, 'bpacks', 'queryBpackByBtype', 'bpack-channel');

		ReadFromLedger(model, res);	    
	},

	get_bpack_by_id: function(req, res){

		console.log("get bpack by id: ");

		var bpackId = req.params.bpackId;
		
		var queryBpackByIdParams = {
			BpackId:    bpackId
		};

		var model = GetRecordMapModel(queryBpackByIdParams, 'bpacks', 'getBpackById', 'bpack-channel');

		ReadFromLedger(model, res);	    
	},



	get_donor_by_id: function(req, res){

		console.log("get donor by id: ");

		var donorId = req.params.donorId;
		
		var queryDonorByIdParams = {
			DonorId:    donorId
		};

		var model = GetRecordMapModel(queryDonorByIdParams, 'donors', 'getDonorById', 'donor-channel');

		ReadFromLedger(model, res);	    
	},

	get_clients_by_range: function(req, res){

		console.log("getting clients by range: ");

		var array = req.params.range.split("-");
		console.log(array);

		var fromIndex = array[0]
		var toIndex = array[1]
		
		var queryRange = {
            FromIndex:     fromIndex,
            ToIndex:       toIndex
		   };
		   
		// Retrieve Blockchain Parameter Mapping Model
		// param(s): fromIndex, toIndex
		var model = GetRecordMapModel(queryRange, 'clients', 'queryClientsByRange', 'client-channel');

		ReadFromLedger(model, res);	    
	},

	create_parsel_order: function(req, res) {

		console.log(" create order for new parsel: ");

		var array = req.params.order.split("-");
		console.log(array);

		var senderId = array[0]
		var receiverId = array[1]

        // TODO: clarify if needs
		var senderBranch = ""
		var receiverBranch = ""

		var parselOrder = {
			SenderId:       senderId,
			SenderBranch:   senderBranch,
			ReceiverId:     receiverId,
			ReceiverBranch:	receiverBranch
		};

		// Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(parselOrder, 'parsels', 'createParselOrder', 'parsel-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	},


	change_bpack_status: function(req, res) {

		console.log(" put an sender branch and TS: ");

		var array = req.params.params.split("-");
		var bpackId  = array[0]
		var status = array[1]
		var holder = array[2]
		var location = array[3]

		console.log(array);

		var statusParams = {
            BpackId:     bpackId,
			Status:      status,
			Holder:      holder,
			Location:    location
		};

		// Retrieve Blockchain Parameter Mapping Model
    	var model = GetRecordMapModel(statusParams, 'bpacks', 'changeBpackStatus', 'bpack-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
       },


	// change_bpack_holder: function(req, res) {
	// 	console.log("put a new holder name and timestamp: ");

	// 	var array = req.params.holder.split("-");
	// 	var bpackId  = array[0]
	// 	var status   = array[1]

	// 	console.log(array);

	// 	var holderParams = {
    //         BpackId:    parselId,
    //         Holder:     holder
	// 	};

	// 	// Retrieve Blockchain Parameter Mapping Model
    // 	var model = GetRecordMapModel(holderParams, 'bpacks', 'changeBpackHolder', 'bpack-channel');
		
	// 	console.log(" The model before write to the ledger: ",  model);
		
	// 	WriteToLedger(model, res);
    //    },


	add_donor: function(req, res){

		console.log("submit recording of new donor: ");

		var array = req.params.donor.split("-");
		console.log(array);

		var name = array[0]
		var address = array[1]
		var phone = array[2]
		var ssn = array[3]
		var age = array[4]
		var sex = array[5]
		var btype = array[6]

		var donorParams = {
            Name:     name,
            Address:  address,
            Phone:    phone,
			SSN:      ssn,
			Age:	  age,
			Sex:	  sex,
			Btype:	  btype	
		};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(donorParams, 'donors', 'addDonor', 'donor-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	},


	update_donor: function(req, res){

		console.log("submit recording for update donor: ");

		var array = req.params.donor.split("-");
		console.log(array);

		var key = array[0]
		var name = array[1]
		var address = array[2]
		var phone = array[3]
		var age = array[4]

		var donorParams = {
			Key:      key,
            Name:     name,
            Address:  address,
            Phone:    phone,
            Age:      age
		};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(donorParams, 'donors', 'updateDonor', 'donor-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	},


	add_donation: function(req, res){

		console.log("submit recording of new donation: ");

		var array = req.params.donation.split("-");
		console.log(array);

		var donorId = array[0]
		var btype   = array[1]
		var amount  = array[2]
		var holder  = array[3]
		var location = array[4]
		var desc    = array[5]
	
		var donationParams = {
            DonorId:  donorId,
            Btype:    btype,
            Amount:   amount,
			Holder:   holder,
			Location: location,
			Desc:	  desc
		};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(donationParams, 'bpacks', 'addBpack', 'bpack-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	},

	get_donor_activity: function(req, res){

		console.log("get donor activity: ");

		var donorId = req.params.donorId

		var activityParams = {
			Key:  donorId
		};

		var model = GetRecordMapModel(activityParams, 'bpacks', 'getDonorActivity', 'bpack-channel');

		ReadFromLedger(model, res);	   
	},


	donor_history: function(req, res){

		console.log("get donor history: ");

		var donorKey = req.params.donorKey

		var historytParams = {
			Key:  donorKey
		};

		var model = GetRecordMapModel(historytParams, 'donors', 'donorHistory', 'donor-channel');

		ReadFromLedger(model, res);	   
	},


    bpack_history: function(req, res){

		console.log("get bpack history: ");

		var bpackId = req.params.bpackId

		var historytParams = {
			Key:  bpackId
		};

		var model = GetRecordMapModel(historytParams, 'bpacks', 'bpackHistory', 'bpack-channel');

		ReadFromLedger(model, res);	   
	},


	do_transfuse: function(req, res){ 

		console.log("put a timestamp, changing owner of bpack on transfuse: ");

		//var array = req.params.bpackId("-");
		//var bpack = array[0]
		

		var bpackId = req.params.bpackId;

		//console.log(array);

		var transfusion = {
            BpackId: bpackId
       	};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(transfusion, 'bpacks', 'doTransfuse', 'bpack-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	},

	delivery_parsel: function(req, res){ 

		console.log("put a timestamp, changing owner of parsel on delivery: ");

		var array = req.params.delivery.split("-");
		var parselId = array[0]
		
		console.log(array);

		var parsel = {
            ParselId: parselId
       	};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(parsel, 'parsels', 'deliveryParsel', 'parsel-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	},

    delete_bpack: function(req, res){

		console.log("Delete bpack from state database. ");

		var bpackId = req.params.bpackId;
		
		var deleteParam = {
            BpackId: bpackId
       	};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(deleteParam, 'bpacks', 'deleteBpack', 'bpack-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	}

}
})();
