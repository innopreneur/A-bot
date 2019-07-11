import {default as Web3} from 'web3';
import Coinmarketcap from '../api/coinmarketcap/index';
import Etherscan from '../api/etherscan/index';
import { INFURA_NODE, FROM } from 'babel-dotenv';
import {default as store} from '../store/index';

let etherscan =  new Etherscan(store);
let coinmarketcap = new Coinmarketcap(store);

async function getAccountBalance(currency){
    try {
        //instantite web3
        let web3 = new Web3(INFURA_NODE);

        //get ETH balance if currency is ETHER
        if(currency == 'ETH') {
            let balanceInWei = await web3.eth.getBalance(FROM);
            return web3.utils.fromWei(balanceInWei, 'ether');
        }

        let tokenAddress = await coinmarketcap.getTokenAddress(currency);
        let balance = await etherscan.getAccountBalance(tokenAddress, FROM);

        return balance;
    }
    catch (error) {
        console.error(error.message);
    }
}

module.exports = {
    getAccountBalance
}