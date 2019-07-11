const Web3  = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const fetch = require("node-fetch");
import { INFURA_NODE, GAS_PRICE_INFO, KEY } from 'babel-dotenv';


async function sendTx(txData, from, to, execution, value) {
   
    try {
        //instantite web3
        let web3 = new Web3(INFURA_NODE);
        //get current nonce
        let nonce = await web3.eth.getTransactionCount(from, "pending");
        console.log(`Nonce for ${from} - ${nonce}`);
        
        //prepare unsigned tx 
        let gasPrice =  await getGasPrice(execution); 
        console.log(`Estimated Gas Price - ${gasPrice}`);

        let rawTransaction = {
            "from": from,
            "nonce": nonce,
            "gasPrice": web3.utils.toHex(parseInt(gasPrice)),
            "gasLimit": web3.utils.toHex(1000000),
            "to": to,
            "value": web3.utils.toWei(value, 'ether'),
            "data": txData,
            "chainId": 4
        };
        
        let tx = new Tx(rawTransaction);
        //sign the transaction
        let privKey = new Buffer.from(KEY, 'hex');
        //sign the transaction
        tx.sign(privKey);
        console.log(`Signed tx`)
        //serialize the given tx to send it to blockchain
        let serializedTx = tx.serialize();
        console.log(`Tx serialised`);
        // send our signed tx to ethereum blockchain
        let signedTx = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
        console.log(`Tx sent to the node`)
        
        //wait for confirmation
        await (new Promise((resolve, reject) => {
            signedTx
                .on('transactionHash', function(hash){
                    console.log(`Tx sent to network with id - ${hash}`);
                    signedTx.off('transactionHash');
                })
                .on('confirmation', function(confirmation, receipt){
                    console.log(`Tx confirmation #${confirmation} ********`)
                    //on 12th confirmation, its relatively safe that tx is processed
                    //so we start another tx
                    if(parseInt(confirmation) > 12){
                        //stop listening to this tx events
                        signedTx.off('confirmation');
                        resolve();
                    }
                })
                .on('error', function(error){
                    reject();
                    throw Error(error);
                });
            }));
    }
    catch(error) {
        console.error(error);
    }
}

async function getGasPrice(execution){
    let response = await fetch(GAS_PRICE_INFO);
    let gasPrice = await response.json();
    
    switch (execution) {
        case 'FASTEST':
            return gasPrice.fastest;
        case 'NORMAL':
            return gasPrice.standard;
        case 'SLOW':
            return gasPrice.safeLow;
        case 'FAST':
            return gasPrice.fast;
        default:
            return gasPrice.standard;
    }
}

module.exports = { sendTx }