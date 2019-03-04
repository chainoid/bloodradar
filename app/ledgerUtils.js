//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */


var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');


    // Global Mapping Function Variable 
    function  runFunction(record){
    
        var argList = [];
        Object.keys(record).forEach(function(key, index) {
            if (record.hasOwnProperty(key)){
                var value = (IsNullOrWhiteSpace(record[key]) ? '' : record[key]);
                argList.push(value);
            }
            else {
                argList.push('');
            }
        });
    
        return argList;
    }
    
    // Get  Record Map Model
    GetRecordMapModel = function(record, chaincodeId, chaincodeFunction, channelId){
                
        var model = {
            Record: record,
            ChaincodeId: chaincodeId,
            ChaincodeFunction: chaincodeFunction,
            ChannelId: channelId
        }		
    
        console.log('Map Model: ', model);
        return model;
    }
    
    
    // Setup Fabric Network
    function SetupFabricNetwork(model){
    
            var fabric_client = new Fabric_Client();
    
            // Setup the fabric network: channel, peer, orderer, peer  
            var channel = fabric_client.newChannel(model.ChannelId);
            var peer = fabric_client.newPeer('grpc://localhost:7051');
            var order = fabric_client.newOrderer('grpc://localhost:7050')
            // connecting..
            channel.addPeer(peer);
            channel.addOrderer(order);
    
            var member_user = null;
            var store_path = path.join(os.homedir(), '.hfc-key-store');
            console.log('Store path:'+store_path);
            var tx_id = null;
            
            // custom fabric network model
            var fabricNetwork = {
                Channel: channel,
                Peer: peer,
                Client: fabric_client,
                MemberUser: member_user,
                StorePath: store_path,
                TrxId: tx_id
            };
    
            // check if chaincode information was passed 
            if (!IsNullOrWhiteSpace(model)){
                fabricNetwork['ChaincodeId'] = model.ChaincodeId; //TODO: Verify this works
                fabricNetwork['ChannelId']   = model.ChannelId;
                fabricNetwork['ChaincodeFunction'] = model.ChaincodeFunction;
            }
    
            return fabricNetwork;
        };
    
    // Sets up Blockchain Network & Performs Read Query 
    ReadFromLedger = function(model, res) {
    
        var FabricNetwork = SetupFabricNetwork(model);
    
        // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
        Fabric_Client.newDefaultKeyValueStore({ path: FabricNetwork.StorePath
        }).then((state_store) => {
            // assign the store to the fabric client
            FabricNetwork.Client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: FabricNetwork.StorePath});
            crypto_suite.setCryptoKeyStore(crypto_store);
            FabricNetwork.Client.setCryptoSuite(crypto_suite);
    
            // get the enrolled user from persistence, this user will sign all requests
            return FabricNetwork.Client.getUserContext('user1', true);
        }).then((user_from_store) => {
    
            // Check if user is enrolled 
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded user1 from persistence');
                FabricNetwork.MemberUser = user_from_store;
            } else {
                throw new Error('Failed to get user1.... run registerUser.js');
            }
            
            //var key = model && model.Record && model.Record.Key ? model.Record.Key : '';
            
            var argList = runFunction(model.Record);

            const request = {
                chaincodeId: FabricNetwork.ChaincodeId, 
                txId: FabricNetwork.TrxId,
                fcn: FabricNetwork.ChaincodeFunction,
                args: argList
            };
    
            console.log('request: ', request);
    
            // send the query proposal to the peer
            return FabricNetwork.Channel.queryByChaincode(request);
        }).then((query_responses) => {
            console.log("Query has completed, checking results");
            // query_responses could have more than one results if there multiple peers were used as targets
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                } else  if  (util.format("%s", query_responses[0])  == "[]") {
                            console.log("No data found");
                            res.send("Error: No data found");  
                         } else  {
                           console.log("Response is ", query_responses[0].toString());
                           res.json(JSON.parse(query_responses[0].toString()));
                         }
               
            } else {
                console.log("No payloads were returned from query");
                res.send("Error: No data found");
            }
        }).catch((err) => {
            console.error('Failed to query successfully : ' + err);
            res.send("Error: No data found");
        });
    }
    
    // Sets up Blockchain Network & Performs Write Query 
    WriteToLedger = function(model, res)  {
    
        var FabricNetwork = SetupFabricNetwork(model);
    
        // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
        Fabric_Client.newDefaultKeyValueStore({ path: FabricNetwork.StorePath
        }).then((state_store) => {
            // assign the store to the fabric client
            FabricNetwork.Client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: FabricNetwork.StorePath});
            crypto_suite.setCryptoKeyStore(crypto_store);
            FabricNetwork.Client.setCryptoSuite(crypto_suite);
    
            // get the enrolled user from persistence, this user will sign all requests
            return FabricNetwork.Client.getUserContext('user1', true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded user1 from persistence');
                FabricNetwork.MemberUser = user_from_store;
            } else {
                throw new Error('Failed to get user1.... run registerUser.js');
            }
    
            // get a transaction id object based on the current user assigned to fabric client
            FabricNetwork.TrxId = FabricNetwork.Client.newTransactionID();
            console.log("Assigning transaction_id: ", FabricNetwork.TrxId._transaction_id);            
    
            var argList = runFunction(model.Record);
    
            // recordConsultant - requires 
            // send proposal to endorser
            const request = {
                //targets : --- letting this default to the peers assigned to the channel
                chaincodeId: FabricNetwork.ChaincodeId, 
                fcn: FabricNetwork.ChaincodeFunction,
                args: argList, 
                chainId: FabricNetwork.ChannelId, 
                txId: FabricNetwork.TrxId
            };
            
            console.log('Request = ', request)
            
            // send the transaction proposal to the peers
            return FabricNetwork.Channel.sendTransactionProposal(request);
        }).then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response &&
                proposalResponses[0].response.status === 200) {
                    isProposalGood = true;
                    console.log('Transaction proposal was good');
                } else {
                    console.error('Transaction proposal was bad');
                }
            if (isProposalGood) {
                console.log(util.format(
                    'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                    proposalResponses[0].response.status, proposalResponses[0].response.message));
                    
                // build up the request for the orderer to have the transaction committed
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal
                };
                
                console.log(' Proposal Request = ', request);
    
                // set the transaction listener and set a timeout of 30 sec
                // if the transaction did not get committed within the timeout period,
                // report a TIMEOUT status
                var transaction_id_string = FabricNetwork.TrxId.getTransactionID(); //Get the transaction ID string to be used by the event processing
                var promises = [];
    
                var sendPromise = FabricNetwork.Channel.sendTransaction(request);
                promises.push(sendPromise); //we want the send transaction first, so that we know where to check status
    
                // Start the new Channed-base Event Hub solution
                console.log('The Transaction sent to ledger');
    
                // get an eventhub once the fabric client has a user assigned. The user
                // is required bacause the event registration must be signed
                let channel_event_hub = FabricNetwork.Channel.newChannelEventHub(FabricNetwork.Peer);
                
                // using resolve the promise so that result status may be processed
                // under the then clause rather than having the catch clause process
                // the status
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        channel_event_hub.unregisterTxEvent(transaction_id_string);
                        channel_event_hub.disconnect();
                        resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                    }, 3000);
    
                    channel_event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                        // this is the callback for transaction event status
                        // first some clean up of event listener
                        clearTimeout(handle);
                        // now let the application know what happened
                        var return_status = { event_status: code, tx_id: transaction_id_string };
                        resolve(return_status);
                        }, (err) => {
                        //this is the callback if something goes wrong with the event registration or processing
                           reject(new Error('There was a problem with the channel eventhub ::' + err)); 
                        },
                        {disconnect: true}
                    );
                    channel_event_hub.connect();
                });
                promises.push(txPromise);
                return Promise.all(promises);
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                res.send(util.format("%s", proposalResponses));
                throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            }
        }).then((results) => {
            console.log('Send transaction promise and event listener promise have completed');
            // check the results in the order the promises were added to the promise all list
            if (results && results[0] && results[0].status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                //res.send(FabricNetwork.TrxId.getTransactionID());
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
            }
    
            if(results && results[1] && results[1].event_status === 'VALID') {
                console.log('Successfully committed the change to the ledger by the peer');
                res.send(FabricNetwork.TrxId.getTransactionID());
            } else {
                console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
            }
        }).catch((err) => {
            console.error('Failed to invoke successfully :: ' + err);
        });
    }
    
    // Utilities
    
    // Check the empty instance 
    function IsNullOrWhiteSpace (instance){
        if (instance !== null && instance !== undefined && instance !== ''){
            return false;
        }		
        else{
            return true;
        }
    }
    
    //module.exports.IsNullOrWhiteSpace = IsNullOrWhiteSpace
    module.exports.GetRecordMapModel  = GetRecordMapModel   
    module.exports.ReadFromLedger     = ReadFromLedger   
    module.exports.WriteToLedger      = WriteToLedger  