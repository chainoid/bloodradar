// SPDX-License-Identifier: Apache-2.0

/*
  Sample Chaincode based on Demonstrated Scenario

 This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/chaincode/fabcar/fabcar.go
*/

package main

/* Imports
* 4 utility libraries for handling bytes, reading and writing JSON,
formatting, and string manipulation
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts
*/
import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

/* Define Parsel structure, with several properties.
Structure tags are used by encoding/json library
*/
type Donor struct {
	Name           string `json:"name"`
  Address        string `json:"address"`
	Phone          string `json:"phone"`
	SSN            string `json:"ssn"`
	Age            string `json:"age"`
	Sex            string `json:"sex"`
	Btype          string `json:"btype"`
}

/*
 *  The random Id generator 
*/
func randomId() string {

	// Call Seed, using current nanoseconds.
  rand.Seed(int64(time.Now().Nanosecond()))
  // Random int will be different each program execution.
  value := rand.Int63()

 return  fmt.Sprintf("%X", value) 
}

/*
  * The Init method *
  called when the Smart Contract "client-chaincode" is instantiated by the network
  * Best practice is to have any Ledger initialization in separate function
  -- see initLedger()
*/
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
  * The Invoke method *
  called when an application requests to run the Smart Contract "posta-chaincode"
  The app also specifies the specific smart contract function to call with args
*/
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "initDonorLedger" {
		return s.initDonorLedger(APIstub)
	} else if function == "queryDonorsByBtype" {
		return s.queryDonorsByBtype(APIstub, args)
	}  else if function == "queryDonor" {
		return s.queryDonor(APIstub, args)
	} else if function == "addDonor" {
		return s.addDonor(APIstub, args)
	} else if function == "updateDonor" {
		return s.updateDonor(APIstub, args)
	} else if function == "removeClient" {
		return s.removeDonor(APIstub, args)
	} else if function == "donorHistory" {
		return s.donorHistory(APIstub, args)
	} else if function == "queryDonorsByRange" {
    	return s.queryDonorsByRange(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
  * The initLedger method *
   Will add test data (4 donors)to our network
*/
func (s *SmartContract) initDonorLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	donors := []Donor{
		Donor{Name: "Alex", SSN: "100001", Address: "Address 1, City, ZIP", Phone: "67-50", Age: "21",  Btype: "Apos"},
	  Donor{Name: "Ben" , SSN: "200002", Address: "Address 1, City, ZIP", Phone: "89-99", Age: "22",  Btype: "ABpos"},
	  Donor{Name: "John", SSN: "300003", Address: "Address 1, City, ZIP", Phone: "44-45", Age: "33",  Btype: "Apos"},
	  Donor{Name: "Nick", SSN: "400004", Address: "Address 1, City, ZIP", Phone: "01-22", Age: "44",  Btype: "Aneg"},
	}

	i := 0
	for i < len(donors) {
		fmt.Println("i is ", i)
		donorAsBytes, _ := json.Marshal(donors[i])

		APIstub.PutState(randomId(), donorAsBytes)
		fmt.Println("Added", donors[i])
		i = i + 1
	}

	return shim.Success(nil)
}


/*
  * The queryDonorsByBtype method *
 allows for assessing all the records added to the ledger(all parsels in the delivery system)
 This method does not take any arguments. Returns JSON string containing results.
*/
func (s *SmartContract) queryDonorsByBtype(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	startKey := "0"
	endKey := "9999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

	  // Create an object
  	donor := Donor{}
	// Unmarshal record to parsel
	json.Unmarshal(queryResponse.Value, &donor)

	// Add only filtered by sender records
	if donor.Btype == args[0] {

		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	}

	buffer.WriteString("]")
	fmt.Printf("- queryDonorsByBtype:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}


/*
  * The queryDonor method *
  Used to view the records of one particular parsel
  It takes one argument -- the key for the parsel in question
*/
func (s *SmartContract) queryDonor(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	parselAsBytes, err := APIstub.GetState(args[0])
	if err != nil {
		return shim.Error("Could not locate client")
	}

	fmt.Printf("- queryDonor:\n%s\n", parselAsBytes)

	return shim.Success(parselAsBytes)
}

/*
  * The addDonor method  
  	This method takes in ).
*/

func (s *SmartContract) addDonor(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	 if len(args) != 7 {
	 	return shim.Error("Incorrect number of arguments. Expecting 7")
	 }

	 var donor = Donor{Name: args[0], Address: args[1], Phone: args[2], SSN: args[3], Age: args[4], Sex: args[5], Btype: args[6]}

	 donorAsBytes, _ := json.Marshal(donor)
	 err := APIstub.PutState(randomId(), donorAsBytes)

	if err != nil {
	 	return shim.Error(fmt.Sprintf("Failed to record new client: %s", args[0]))
	}

	fmt.Printf("- addDonor:\n%s\n", donorAsBytes)

	return shim.Success(nil)
}


/*
  * The updateDonor method *
 allows for update _some_ fields of selected donor 

 Returns JSON string containing results.
*/
func (s *SmartContract) updateDonor(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	donorAsBytes, _ := APIstub.GetState(args[0])
	if donorAsBytes == nil {

        fmt.Printf("- updateDonor with id: %sDonor not found \n", args[0])

		return shim.Error("Donor not found")
	}

	donor :=Donor{}

	json.Unmarshal(donorAsBytes, &donor)

	// Update donor fields
	donor.Name    = args[1]
	donor.Address = args[2]
	donor.Phone   = args[3]
	// SSN   -- unmutable
	donor.Age     = args[4]
	// Sex   -- unmutable
	// Btype -- unmutable

	donorAsBytes, _ = json.Marshal(donor)
	err := APIstub.PutState(args[0], donorAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to update donor with Id: %s", args[0]))
	}

	fmt.Printf("- updateDonor:\n%s\n", donorAsBytes)

	return shim.Success(nil)

}

/*
  * The deleteClient method *
 The data in the world state can be updated with who has possession.
 This function takes in 2 arguments, parsel id and timestamp of delivery.
*/
func (s *SmartContract) removeDonor(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }

	// parselAsBytes, _ := APIstub.GetState(args[0])
	// if parselAsBytes == nil {

    //     fmt.Printf("- deliveryParsel with id: %s Parsel not found \n", args[0])

	// 	return shim.Error("Parsel not found")
	// }
	// parsel := Parsel{}

	// json.Unmarshal(parselAsBytes, &parsel)
	// // Normally check that the specified argument is a valid holder of parsel
	// // we are skipping this check for this example
	
	// if parsel.ReceiverTS != "" {

	// 	fmt.Printf("- deliveryParsel with id: %s Already delivered \n", args[0])

	// 	return shim.Error("Already delivered")
	// }

	// parsel.ReceiverTS = time.Now().Format(time.RFC3339)

	// parselAsBytes, _ = json.Marshal(parsel)
	// err := APIstub.PutState(args[0], parselAsBytes)
	// if err != nil {
	// 	return shim.Error(fmt.Sprintf("Failed to change status of parsel: %s", args[0]))
	// }

	// fmt.Printf("- removeClient:\n%s\n", parselAsByDonor	
	
	return shim.Success(nil)
}

/*
 * The getHistoryForKey method *
 */
func (s *SmartContract) donorHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	resultsIterator, err := APIstub.GetHistoryForKey(args[0])

	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false

	for resultsIterator.HasNext() {

		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		json.Marshal(queryResponse)

		// Some extra historical fields
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(string(queryResponse.TxId))
		buffer.WriteString("\"")
		buffer.WriteString(",\"TxTS\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(queryResponse.Timestamp.Seconds, 0).Format(time.RFC3339))
		buffer.WriteString("\"")
		buffer.WriteString(",\"IsDelete\":")
		buffer.WriteString(strconv.FormatBool(queryResponse.IsDelete))

		// Record the body of JSON object, so we write as-is
		buffer.WriteString(", \"Record\":")
		buffer.WriteString(string(queryResponse.Value))

		buffer.WriteString("}")

		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- donorHistory:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// ===========================================================================================
// getClientsByRange performs a range query based on the start and end keys provided.

// Read-only function results are not typically submitted to ordering. If the read-only
// results are submitted to ordering, or if the query is used in an update transaction
// and submitted to ordering, then the committing peers will re-execute to guarantee that
// result sets are stable between endorsement time and commit time. The transaction is
// invalidated by the committing peers if the result set has changed between endorsement
// time and commit time.
// Therefore, range queries are a safe option for performing update transactions based on query results.
// ===========================================================================================
func (s *SmartContract) queryDonorsByRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	startKey := args[0]
	endKey   := args[1]

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	buffer, err := constructQueryResponseFromIterator(resultsIterator)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("- getClientsByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}


// ===== Example: Pagination with Ad hoc Rich Query ========================================================
//
// queryDonorsWithPagination uses a query string, page size and a bookmark to perform a query
// for marbles. Query string matching state database syntax is passed in and executed as is.
// The number of fetched records would be equal to or lesser than the specified page size.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the queryMarblesForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
// Paginated queries are only valid for read only transactions.
// =========================================================================================
func (s *SmartContract) queryDonorsWithPagination(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	//   0
	// "queryString"
	if len(args) < 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	queryString := args[0]
	//return type of ParseInt is int64
	pageSize, err := strconv.ParseInt(args[1], 10, 32)
	if err != nil {
		return shim.Error(err.Error())
	}
	bookmark := args[2]

	queryResults, err := getQueryResultForQueryStringWithPagination(APIstub, queryString, int32(pageSize), bookmark)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// =========================================================================================
// getQueryResultForQueryStringWithPagination executes the passed in query string with
// pagination info. Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func getQueryResultForQueryStringWithPagination(stub shim.ChaincodeStubInterface, queryString string, pageSize int32, bookmark string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, responseMetadata, err := stub.GetQueryResultWithPagination(queryString, pageSize, bookmark)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	buffer, err := constructQueryResponseFromIterator(resultsIterator)
	if err != nil {
		return nil, err
	}

	bufferWithPaginationInfo := addPaginationMetadataToQueryResults(buffer, responseMetadata)

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", bufferWithPaginationInfo.String())

	return buffer.Bytes(), nil
}

// ===========================================================================================
// constructQueryResponseFromIterator constructs a JSON array containing query results from
// a given result iterator
// ===========================================================================================
func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) (*bytes.Buffer, error) {
	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return &buffer, nil
}

// ===========================================================================================
// addPaginationMetadataToQueryResults adds QueryResponseMetadata, which contains pagination
// info, to the constructed query results
// ===========================================================================================
func addPaginationMetadataToQueryResults(buffer *bytes.Buffer, responseMetadata *sc.QueryResponseMetadata) *bytes.Buffer {

	buffer.WriteString("[{\"ResponseMetadata\":{\"RecordsCount\":")
	buffer.WriteString("\"")
	buffer.WriteString(fmt.Sprintf("%v", responseMetadata.FetchedRecordsCount))
	buffer.WriteString("\"")
	buffer.WriteString(", \"Bookmark\":")
	buffer.WriteString("\"")
	buffer.WriteString(responseMetadata.Bookmark)
	buffer.WriteString("\"}}]")

	return buffer
}

/*
  * main function *
 calls the Start function
 The main function starts the chaincode in the container during instantiation.
*/
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
