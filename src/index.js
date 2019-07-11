require('dotenv').config();
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

import { findBetterDeal, calculateBuySellDeal, calculateSellBuyProfitability } from './watcher';
import { PAIR } from 'babel-dotenv';
import {default as store} from './store';
import BittrexMarkets from './api/bittrex/bittrexMarkets';
import BittrexTrades from './api/bittrex/bittrexTrades';
import Uniswap from './api/uniswap/uniswap';
import CoinMarketCap from './api/coinmarketcap/index';
import BigNumber from 'bignumber.js';
import { getAccountBalance } from './utils/balances';

//watchSellEth('0x58b6a8a3302369daec383334672404ee733ab239', 1);
//watchSellToken('0x985dd3d42de1e256d09e1c10f112bccb8015ad41', 1);

 
// Get document, or throw exception on error
try {
    //read configuration
    //let yamlPath = path.join(__dirname, '..', 'config.yaml');
    //let config = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
    //initialize watchdogs
    //initialize(config.watchers);
    //console.log(`Initial State - ${JSON.stringify(store.getState())}`);
   /*let bittrexMarkets = new BittrexMarkets(store);
    bittrexMarkets.subscribeToMarkets(['USDT-OCEAN']);
    bittrexMarkets.handleOrderBookCreationEvent();
    bittrexMarkets.handleOrderBookUpdateEvent(); */

    //let bittrexTrades = new BittrexTrades(store);
    
    //let uniswap = new Uniswap(store);
   
    //performSellBuyTx(bittrexTrades, uniswap);
    
    
    
    /*let unsubscribe = store.subscribe(async () => {
        //let currentSeq = store.getState().markets[0].currentOrderSeq;
        //console.log(`Updated store (${currentSeq})- ${JSON.stringify(store.getState().markets[0].buyOrders)}`);

        let orderbook = await bittrexTrades.getOrderbook(PAIR);
        console.log(orderbook)
        const {result : {buy, sell}} = orderbook;

        let actualBuy = store.getState().markets[0].buyOrders;

        console.log(assert.deepEqual(actualBuy, buy));
         
    });*/


    /*
    let inputToken = '0x985dd3d42de1e256d09e1c10f112bccb8015ad41'; //OCEAN
    let outputToken = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'; //DAI

    setTimeout(async () => {

        let orderbook = await bittrexTrades.getOrderbook(PAIR);
        //console.log(orderbook)
        const {result : {buy, sell}} = orderbook;
        console.log(sell[0])
        let ticker = await bittrexTrades.getTicker(PAIR);
        let outputTokenAmount = await uniswap.getTokenToTokenInputPrice(inputToken, outputToken, Number(sell[0].Quantity));

        console.log(`--------- ${Date.now()} -------------`)
        console.log(JSON.stringify(ticker))
        console.log(`......................................`)
        console.log(`{OCEAN : 1, DAI : ${outputTokenAmount}}`)
        console.log(`-------------------------------`)
        //findBetterDeal(outputTokenAmount, ticker);
        //console.log( await uniswap.getPoolSize('OCEAN', inputToken))
        calculateSellBuyProfitability(outputTokenAmount, sell[0]);
       
    }, 10);

    */


    /******************* PAIR DISCOVERY ***************/
    //discoverPairs();
    //getTxFee('GAM')
    showAccountBalance();
   
} catch (e) {
    console.log(e);
}

function initialize(watchers){
    watchers.map(w => {
        switch(w.orderType) {
            case 'sell' :
                if(w.operationOn == 'token') {
                    let amount = parseFloat(w.amount)
                    watchSellToken(w.tokenAddress, amount, w.conditions);
                }
                else {
                    let amount = parseFloat(w.amount)
                    watchSellEth(w.tokenAddress, amount, w.conditions);
                }
        }
    })
}


async function performSellBuyTx(bittrexTrades, uniswap){
    let inputToken = '0x985dd3d42de1e256d09e1c10f112bccb8015ad41'; //OCEAN
    let outputToken = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'; //DAI

    //1) Get latest sell order from Bittrex
    let orderbook = await bittrexTrades.getOrderbook(PAIR);
    const {result : {buy, sell}} = orderbook;
    console.log(sell[0])

    // 2) Validate Buy Qty against pool side
    let { OCEAN } = await uniswap.getPoolSize('OCEAN', inputToken);
    if(!OCEAN >= sell[0].Quantity) {
        process.exit(-1);
    }

    // 3) Get Prices from Uniswap for OCEAN -> DAI
    let outputTokenAmount = await uniswap.getTokenToTokenInputPrice(inputToken, outputToken, Number(sell[0].Quantity));

    // 4)  calculate Profit percentage
    calculateSellBuyProfitability(outputTokenAmount, sell[0]);

}

async function discoverPairs(){
    let cmcap = new CoinMarketCap(store);
    let uniswap = new Uniswap(store);    
    let bittrex = new BittrexTrades(store);
    let bittrexCrypto = await bittrex.getCurrencies();
    let {result} = bittrexCrypto;
    let currencies = await Promise.all(result.map(item => item.Currency));
    console.log(JSON.stringify(currencies));
    console.log("*********************************")
    let listings = await cmcap.getCryptoListings();
    let { data } = listings;
    data.map(async (item) => {
        if(item.platform && item.platform.name == 'Ethereum'){
            let exchangeAddress = await uniswap.getExchange(item.platform.token_address);
            if(exchangeAddress != '0x0000000000000000000000000000000000000000'){
                if(currencies.indexOf(item.symbol) != -1) {
                    console.log(`${item.symbol},${item.name},${item.platform.token_address},${item.quote.USD.market_cap}, ${exchangeAddress}`);
                }
            }
        }
    })
}

async function getTxFee(currency){
    let bittrexTrades = new BittrexTrades(store);
    console.log(`TxFee - ${await bittrexTrades.getTxFee(currency)}`)
}

async function showAccountBalance(){
    console.log(await getAccountBalance('DAI'));
    console.log(await getAccountBalance('ETH'));
}