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
	Amount         string `json:"amount"`
	Location       string `json:"location"` 
	Holder				 string `json:"holder"`
	HolderTS			 string `json:"holderTS"`
  Status         string `json:"status"`
	Desc           string `json:"desc"`
	
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
	} else if function == "addBpack" {
		return s.addBpack(APIstub, args)
	} else if function == "queryBpackByBtype" {
		return s.queryBpackByBtype(APIstub, args)
	} else if function == "doTransfuse" {
		return s.doTransfuse(APIstub, args)
	} else if function == "bpackHistory" {
		return s.bpackHistory(APIstub, args)
	} else if function == "changeBpackStatus" {
		return s.changeBpackStatus(APIstub, args)
	} else if function == "deleteBpack" {
		return s.deleteBpack(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
  * The initLedger method *
 Will add test data (5 parsels)to our network
*/
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	bpacks := []Bpack{
		Bpack{Btype: "Apos", DonorId: "1234567890", DonationTS: time.Now().Format(time.RFC3339), Location: "50.000, 30.000", Amount: "200", Holder: "BankOne", Status: "TESTED", Desc: "Campus One compain"},
		Bpack{Btype: "Apos", DonorId: "2234567890", DonationTS: time.Now().Format(time.RFC3339), Location: "51.000, 31.000", Amount: "350", Holder: "BankOne", Status: "DRAWN",  Desc: "Campus One compain"},
		Bpack{Btype: "Apos", DonorId: "5634567890", DonationTS: time.Now().Format(time.RFC3339), Location: "51.000, 32.000", Amount: "340", Holder: "BankOne", Status: "DRAWN",  Desc: "Campus One compain"},
		
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
  * The addBpack (Add donation) method
*/
func (s *SmartContract) addBpack(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	 if len(args) != 6 {
	 	return shim.Error("Incorrect number of arguments. Expecting 6")
	 }

	 var bpack = Bpack{Btype: args[1],  DonorId: args[0], DonationTS: time.Now().Format(time.RFC3339), Amount: args[2], Location: args[4], Holder: args[3], Status: "DRAWN",  Desc: args[5]}

	 bpackAsBytes, _ := json.Marshal(bpack)
	 err := APIstub.PutState(randomId(), bpackAsBytes)

	  if err != nil {
	 	   return shim.Error(fmt.Sprintf("Failed to record new bpack for donorID: %s", args[0]))
	  }

	fmt.Printf("- addBpack:\n%s\n", bpackAsBytes)

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
  * The changeBpackStatus method *
 The data in the world state can be updated with who has possession.
 This function takes in 2 arguments, courier id and timestamp of action.
*/
func (s *SmartContract) changeBpackStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	bpackAsBytes, _ := APIstub.GetState(args[0])

	if bpackAsBytes == nil {

        fmt.Printf("- changeBpackStatus with id: %s Bpack not found \n", args[0])

		return shim.Error("Bpack not found")
	}
	bpack := Bpack{}

	json.Unmarshal(bpackAsBytes, &bpack)


    // Chack that parsel not accepted before 
	if bpack.Status == "DELETED" {

		fmt.Printf("- changeBpackStatus with id: %s Already accepted \n", args[0])

		return shim.Error("Deleted bpack")
	}


	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	bpack.Status = args[1]
	bpack.HolderTS = time.Now().Format(time.RFC3339)
	bpack.Holder = args[2]
	bpack.Location = args[3]


	bpackAsBytes, _ = json.Marshal(bpack)
	err := APIstub.PutState(args[0], bpackAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change status of bpack: %s", args[0]))
	}

	fmt.Printf("- changeBpackStatus:\n%s\n", bpackAsBytes)

	return shim.Success(nil)
}


/*
  * The switchCourier method *
 The data in the world state can be updated with who has possession.
 This function takes in 2 arguments, courier id and timestamp of action.
*/
// func (s *SmartContract) switchCourier(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

// 	if len(args) != 2 {
// 		return shim.Error("Incorrect number of arguments. Expecting 2")
// 	}

// 	parselAsBytes, _ := APIstub.GetState(args[0])
// 	if parselAsBytes == nil {

//         fmt.Printf("- switchCourier with id: %s Parsel not found \n", args[0])

// 		return shim.Error("Parsel not found")
// 	}
// 	parsel := Parsel{}

// 	json.Unmarshal(parselAsBytes, &parsel)

// 	// Normally check that the specified argument is a valid holder of parsel
// 	// we are skipping this check for this example
// 	parsel.CourierId = args[1]

// 	parsel.CourierTS = time.Now().Format(time.RFC3339)

// 	parselAsBytes, _ = json.Marshal(parsel)
// 	err := APIstub.PutState(args[0], parselAsBytes)
// 	if err != nil {
// 		return shim.Error(fmt.Sprintf("Failed to change courier for parsel: %s", args[0]))
// 	}

// 	fmt.Printf("- switchCourier:\n%s\n", parselAsBytes)

// 	return shim.Success(nil)
// }



/*
  * The doTransfuse method *
 The data in the world state can be updated with who has possession.
 This function takes in 1 arguments, parsel id. Timestamp of delivery generate by fact.
*/
func (s *SmartContract) doTransfuse(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	bpackAsBytes, _ := APIstub.GetState(args[0])
	if bpackAsBytes == nil {

        fmt.Printf("- doTransfuse with id: %s Bpack not found \n", args[0])

		return shim.Error("Bpack not found")
	}
	bpack := Bpack{}

	json.Unmarshal(bpackAsBytes, &bpack)

	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	// if parsel.ReceiverTS != "" {

	// 	fmt.Printf("- deliveryParsel with id: %s Already delivered \n", args[0])

	// 	return shim.Error("Already delivered")
	// }

	bpack.HolderTS = time.Now().Format(time.RFC3339)
	bpack.Status   = "TRANSFUSED"

	bpackAsBytes, _ = json.Marshal(bpack)
	err := APIstub.PutState(args[0], bpackAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change status of bpack: %s", args[0]))
	}

	fmt.Printf("- doTransfuse:\n%s\n", bpackAsBytes)

	return shim.Success(nil)
}


/*
 * The deleteParsel method *
   The data in the world state can be updated with who has possession.
   This function takes in 1 arguments, parsel id. Timestamp of delivery generate by fact.
*/
func (s *SmartContract) deleteBpack(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	bpackAsBytes, _ := APIstub.GetState(args[0])
	if bpackAsBytes == nil {

        fmt.Printf("- deleteBpack with id: %s Bpack not found \n", args[0])

		return shim.Error("Bpack not found")
	}


	//  TODO  - condition when inpossible delete the bpack 
	//
	//parsel := Parsel{}
  //json.Unmarshal(parselAsBytes, &parsel)
	// Normally check that the specified argument is a valid holder of parsel
	// we are skipping this check for this example
	// if parsel.ReceiverTS == "" {
	// 	fmt.Printf("- deleteParsel with id: %s Already delivered \n", args[0])
	// 	return shim.Error("Not delivered")
	// }
	
   err := APIstub.DelState(args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change status of bpack: %s", args[0]))
	}

	fmt.Printf("- deleteBpack:\n%s\n", bpackAsBytes)

	return shim.Success(nil)
}


/*
 * The getHistoryForKey method *
 */
func (s *SmartContract) bpackHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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

			var bpack = Bpack{Btype: "", DonorId: "", DonationTS: "", Location: "", Holder: "", Status: "",  Desc: ""}

			bpackAsBytes, _ := json.Marshal(bpack)
			buffer.WriteString(string(bpackAsBytes))

		}

		buffer.WriteString("}")

		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- bpackHistory:\n%s\n", buffer.String())

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
