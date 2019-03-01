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
type Parsel struct {
	SenderId       string `json:"senderId"`
	SenderTS       string `json:"senderTS"`
	SenderBranch   string `json:"senderBranch"`
	CourierId      string `json:"courierId"`
	CourierTS      string `json:"courierTS"` 
	ReceiverId     string `json:"receiverId"`
	ReceiverTS     string `json:"receiverTS"`
	ReceiverBranch string `json:"receiverBranch"`
}


/* Define Bpack structure, with several properties.
Structure tags are used by encoding/json library
*/
type Bpack struct {
	Btype          string `json:"btype"`
	DonorId        string `json:"donorId"`
	DonationTS     string `json:"donationTS"`
	Location       string `json:"location"` 
	Holder				 string `json:"holder"`
  Status         string `json:"status"`
	Desc           string `json:"desc"`

	//CourierId      string `json:"courierId"`
	//CourierTS      string `json:"courierTS"` 
	//ReceiverId     string `json:"receiverId"`
	//ReceiverTS     string `json:"receiverTS"`
	
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
  called when the Smart Contract "posta-chaincode" is instantiated by the network
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
	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createParselOrder" {
		return s.createParselOrder(APIstub, args)
	} else if function == "queryBpackByBtype" {
		return s.queryBpackByBtype(APIstub, args)
	} else if function == "deliveryParsel" {
		return s.deliveryParsel(APIstub, args)
	} else if function == "clientSentParsels" {
		return s.clientSentParsels(APIstub, args)
	}  else if function == "clientReceivedParsels" {
		return s.clientReceivedParsels(APIstub, args)
	}else if function == "parselHistory" {
		return s.parselHistory(APIstub, args)
	} else if function == "switchCourier" {
		return s.switchCourier(APIstub, args)
	} else if function == "acceptParsel" {
		return s.acceptParsel(APIstub, args)
	} else if function == "deleteParsel" {
		return s.deleteParsel(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
  * The initLedger method *
 Will add test data (5 parsels)to our network
*/
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	bpacks := []Bpack{
		Bpack{Btype: "Apos", DonorId: "1234567890", DonationTS: time.Now().Format(time.RFC3339), Location: "50.000, 30.000", Holder: "BankOne", Status: "TESTED", Desc: "Campus One compain"},
		Bpack{Btype: "Apos", DonorId: "2234567890", DonationTS: time.Now().Format(time.RFC3339), Location: "51.000, 31.000", Holder: "BankOne", Status: "DRAWN",  Desc: "Campus One compain"},
		
	}

	i := 0
	for i < len(bpacks) {
		fmt.Println("i is ", i)
		bpackAsBytes, _ := json.Marshal(bpacks[i])

		APIstub.PutState(randomId(), bpackAsBytes)
		fmt.Println("Added", bpacks[i])
		i = i + 1
	}

	return shim.Success(nil)
}

/*
  * The queryParsel method *
  Used to view the records of one particular parsel
  It takes one argument -- the key for the parsel in question
*/
func (s *SmartContract) queryParsel(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	parselAsBytes, err := APIstub.GetState(args[0])
	if err != nil {
		return shim.Error("Could not locate parsel")
	}

	fmt.Printf("- queryParsel:\n%s\n", parselAsBytes)

	return shim.Success(parselAsBytes)
}

/*
  * The createParselOrder method
*/
func (s *SmartContract) createParselOrder(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	 if len(args) != 4 {
	 	return shim.Error("Incorrect number of arguments. Expecting 4")
	 }

	 var parsel = Parsel{SenderId: args[0], SenderBranch: args[1], SenderTS: time.Now().Format(time.RFC3339), ReceiverId: args[2], ReceiverBranch: args[3], ReceiverTS: "", CourierId: "", CourierTS:"" }

	 parselAsBytes, _ := json.Marshal(parsel)
	 err := APIstub.PutState(randomId(), parselAsBytes)

	  if err != nil {
	 	return shim.Error(fmt.Sprintf("Failed to record new parsel: %s", args[0]))
	 }

	fmt.Printf("- createParselOrder:\n%s\n", parselAsBytes)

	return shim.Success(nil)
}

/*
  * The queryAllParsels method *
 allows for assessing all the records added to the ledger(all parsels in the delivery system)
 This method does not take any arguments. Returns JSON string containing results.
*/
func (s *SmartContract) queryBpackByBtype(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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
    bpack := Bpack{}
  // Unmarshal record to parsel
  json.Unmarshal(queryResponse.Value, &bpack)

  // Add only filtered by btype
  if bpack.Btype == args[0] && (bpack.Status == args[1] || args[1] == "ALL") {

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

	fmt.Printf("- queryBpackByBtype:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
  * The clientSentParsels method *
 allows for assessing all the records from selected sender

 Returns JSON string containing results.
*/
func (s *SmartContract) clientSentParsels(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {


	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

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
		parsel := Parsel{}
		// Unmarshal record to parsel
		json.Unmarshal(queryResponse.Value, &parsel)

		// Add only filtered by sender records
		if parsel.SenderId == args[0] {

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

	//if bArrayMemberAlreadyWritten == false {
	//	return shim.Error("No data found")
	//}

	fmt.Printf("- getClientSentParsels:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}


/*
  * The clientReceivedParsels method *
 allows for assessing all the records from selected sender

 Returns JSON string containing results.
*/
func (s *SmartContract) clientReceivedParsels(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

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
		parsel := Parsel{}
		// Unmarshal record to parsel
		json.Unmarshal(queryResponse.Value, &parsel)

		// Add only filtered by sender records
		if parsel.ReceiverId == args[0] {

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

	//if bArrayMemberAlreadyWritten == false {
	//	return shim.Error("No data found")
	//}

	fmt.Printf("- clientReceivedParsels:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}


/*
  * The switchCourier method *
 The data in the world state can be updated with who has possession.
 This function takes in 2 arguments, courier id and timestamp of action.
*/
func (s *SmartContract) acceptParsel(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	parselAsBytes, _ := APIstub.GetState(args[0])
	if parselAsBytes == nil {

        fmt.Printf("- acceptParsel with id: %s Parsel not found \n", args[0])

		return shim.Error("Parsel not found")
	}
	parsel := Parsel{}

	json.Unmarshal(parselAsBytes, &parsel)


    // Chack that parsel not accepted before 
	if parsel.SenderBranch != "" {

		fmt.Printf("- acceptParsel with id: %s Already accepted \n", args[0])

		return shim.Error("Already accepted")
	}


	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	parsel.SenderBranch = args[1]

	parsel.SenderTS = time.Now().Format(time.RFC3339)

	parselAsBytes, _ = json.Marshal(parsel)
	err := APIstub.PutState(args[0], parselAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change courier for parsel: %s", args[0]))
	}

	fmt.Printf("- acceptParsel:\n%s\n", parselAsBytes)

	return shim.Success(nil)
}


/*
  * The switchCourier method *
 The data in the world state can be updated with who has possession.
 This function takes in 2 arguments, courier id and timestamp of action.
*/
func (s *SmartContract) switchCourier(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	parselAsBytes, _ := APIstub.GetState(args[0])
	if parselAsBytes == nil {

        fmt.Printf("- switchCourier with id: %s Parsel not found \n", args[0])

		return shim.Error("Parsel not found")
	}
	parsel := Parsel{}

	json.Unmarshal(parselAsBytes, &parsel)

	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	parsel.CourierId = args[1]

	parsel.CourierTS = time.Now().Format(time.RFC3339)

	parselAsBytes, _ = json.Marshal(parsel)
	err := APIstub.PutState(args[0], parselAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change courier for parsel: %s", args[0]))
	}

	fmt.Printf("- switchCourier:\n%s\n", parselAsBytes)

	return shim.Success(nil)
}



/*
  * The deliveryParsel method *
 The data in the world state can be updated with who has possession.
 This function takes in 1 arguments, parsel id. Timestamp of delivery generate by fact.
*/
func (s *SmartContract) deliveryParsel(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	parselAsBytes, _ := APIstub.GetState(args[0])
	if parselAsBytes == nil {

        fmt.Printf("- deliveryParsel with id: %s Parsel not found \n", args[0])

		return shim.Error("Parsel not found")
	}
	parsel := Parsel{}

	json.Unmarshal(parselAsBytes, &parsel)

	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	if parsel.ReceiverTS != "" {

		fmt.Printf("- deliveryParsel with id: %s Already delivered \n", args[0])

		return shim.Error("Already delivered")
	}

	parsel.ReceiverTS = time.Now().Format(time.RFC3339)

	parselAsBytes, _ = json.Marshal(parsel)
	err := APIstub.PutState(args[0], parselAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change status of parsel: %s", args[0]))
	}

	fmt.Printf("- deliveryParsel:\n%s\n", parselAsBytes)

	return shim.Success(nil)
}


/*
 * The deleteParsel method *
   The data in the world state can be updated with who has possession.
   This function takes in 1 arguments, parsel id. Timestamp of delivery generate by fact.
*/
func (s *SmartContract) deleteParsel(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	parselAsBytes, _ := APIstub.GetState(args[0])
	if parselAsBytes == nil {

        fmt.Printf("- deleteParsel with id: %s Parsel not found \n", args[0])

		return shim.Error("Parsel not found")
	}
	parsel := Parsel{}

	json.Unmarshal(parselAsBytes, &parsel)

	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	if parsel.ReceiverTS == "" {

		fmt.Printf("- deleteParsel with id: %s Already delivered \n", args[0])

		return shim.Error("Not delivered")
	}

	//parsel.ReceiverTS = time.Now().Format(time.RFC3339)
    //
    //parselAsBytes, _ = json.Marshal(parsel)

    err := APIstub.DelState(args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change status of parsel: %s", args[0]))
	}

	fmt.Printf("- deleteParsel:\n%s\n", parselAsBytes)

	return shim.Success(nil)
}


/*
 * The getHistoryForKey method *
 */
func (s *SmartContract) parselHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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

		if queryResponse.Value != nil {
    		buffer.WriteString(string(queryResponse.Value))
		} else {
			//buffer.WriteString("{}")

			var parsel = Parsel{SenderId: "", SenderBranch: "", SenderTS: "", ReceiverId: "", ReceiverBranch: "", ReceiverTS: "", CourierId: "", CourierTS:"" }

			parselAsBytes, _ := json.Marshal(parsel)
			buffer.WriteString(string(parselAsBytes))

		}

		buffer.WriteString("}")

		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- parselHistory:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
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
