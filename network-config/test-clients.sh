#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

starttime=$(date +%s)

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 5  parsels
docker-compose -f ./docker-compose.yml up -d cli


# Invoke chaincodes when ready
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C parsel-channel -n parsels -c '{"function":"initLedger","Args":[""]}'




#for i in `seq 1 1000`;
for i in $(seq -f "%05g" 10 110)
        do
          echo $i
        
          A='"AL'$i'"'
          B='"Adr'$i',City,ZIP"'
          C='"+380.'$i'"'
          D='"B.'$i'"'

        docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C client-channel -n clients -c '{"function":"addClient","Args":['$A', '$B', '$C', '$D']}'

        done  

printf "\nTotal execution time : $(($(date +%s) - starttime)) secs ...\n\n"
	
