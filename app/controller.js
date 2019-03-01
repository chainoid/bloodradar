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
	
	get_all_parsels: function(req, res){

		console.log("getting all parsels from ledger: ");
		
		var queryParselListParams = {
			Key: '' // For now we pass a blank string to query all parsels,
			        // TODO : add fromKey, toKey
		};

		var model = GetRecordMapModel(queryParselListParams, 'parsels', 'queryAllParsels', 'parsel-channel');

		ReadFromLedger(model, res);
	},	


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


	accept_parsel: function(req, res) {

		console.log(" put an sender branch and TS: ");

		var array = req.params.accept.split("-");
		var parselId  = array[0]
		var branchId = array[1]

		console.log(array);

		var acceptParsel = {
            ParselId:    parselId,
            BranchId:    branchId
		};

		// Retrieve Blockchain Parameter Mapping Model
    	var model = GetRecordMapModel(acceptParsel, 'parsels', 'acceptParsel', 'parsel-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
       },


	switch_courier: function(req, res) {
		console.log("put a new courier name and timestamp: ");

		var array = req.params.switch.split("-");
		var parselId  = array[0]
		var courierId = array[1]

		console.log(array);

		var switchOrder = {
            ParselId:    parselId,
            CourierId:   courierId
		};

		// Retrieve Blockchain Parameter Mapping Model
    	var model = GetRecordMapModel(switchOrder, 'parsels', 'switchCourier', 'parsel-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
       },


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

	get_parsel: function(req, res){

		// var fabric_client = new Fabric_Client();
		// var key = req.params.id

		// // setup the fabric network
		// var channel = fabric_client.newChannel('posta-channel');
		// var peer = fabric_client.newPeer('grpc://localhost:7051');
		// channel.addPeer(peer);

		// //
		// var member_user = null;
		// var store_path = path.join(os.homedir(), '.hfc-key-store');
		// console.log('Store path:'+store_path);
		// var tx_id = null;

		// // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		// Fabric_Client.newDefaultKeyValueStore({ path: store_path
		// }).then((state_store) => {
		//     // assign the store to the fabric client
		//     fabric_client.setStateStore(state_store);
		//     var crypto_suite = Fabric_Client.newCryptoSuite();
		//     // use the same location for the state store (where the users' certificate are kept)
		//     // and the crypto store (where the users' keys are kept)
		//     var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		//     crypto_suite.setCryptoKeyStore(crypto_store);
		//     fabric_client.setCryptoSuite(crypto_suite);

		//     // get the enrolled user from persistence, this user will sign all requests
		//     return fabric_client.getUserContext('user1', true);
		// }).then((user_from_store) => {
		//     if (user_from_store && user_from_store.isEnrolled()) {
		//         console.log('Successfully loaded user1 from persistence');
		//         member_user = user_from_store;
		//     } else {
		//         throw new Error('Failed to get user1.... run registerUser.js');
		//     }

		//     // getParsel - requires 1 argument, ex: args: ['4'],
		//     const request = {
		//         chaincodeId: 'postap',
		//         txId: tx_id,
		//         fcn: 'queryParsel',
		//         args: [key]
		//     };

		//     // send the query proposal to the peer
		//     return channel.queryByChaincode(request);
		// }).then((query_responses) => {
		//     console.log("Query has completed, checking results");
		//     // query_responses could have more than one  results if there multiple peers were used as targets
		//     if (query_responses && query_responses.length == 1) {
		//         if (query_responses[0] instanceof Error) {
		//             console.error("error from query = ", query_responses[0]);
		//             res.send("Could not locate parsel")
		            
		// 		} if (query_responses[0].length == 0) {
        //             console.error("Empty record from query.");
		//             res.send("Could not locate parsel")   
		// 		} else {
		//             console.log("Response size is ", query_responses[0].length);
		//             res.send(query_responses[0].toString())
		//         }
		//     } else {
		//         console.log("No payloads were returned from query");
		//         res.send("Could not locate parsel")
		//     }
		// }).catch((err) => {
		//     console.error('Failed to query successfully :: ' + err);
		//     res.send("Could not locate parsel")
		// });
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


    parsel_history: function(req, res){

		console.log("get parsel history: ");

		var parselId = req.params.parselId

		var historytParams = {
			Key:  parselId
		};

		var model = GetRecordMapModel(historytParams, 'parsels', 'parselHistory', 'parsel-channel');

		ReadFromLedger(model, res);	   
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

    delete_parsel: function(req, res){

		console.log("Delete parsel from state database. ");

		var parselId = req.params.parselId;
		
		var parsel = {
            ParselId: parselId
       	};

        // Retrieve Blockchain Parameter Mapping Model
		// param(s): record, chaincodeId, chaincodeFunction, channelId
		var model = GetRecordMapModel(parsel, 'parsels', 'deleteParsel', 'parsel-channel');
		
		console.log(" The model before write to the ledger: ",  model);
		
		WriteToLedger(model, res);
	}

}
})();
