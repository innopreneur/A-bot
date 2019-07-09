require('dotenv').config();
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

import { findBetterDeal, calculateBuySellDeal, calculateSellBuyDeal } from './watcher';
import { PAIR } from 'babel-dotenv';
import {default as store} from './store';
import BittrexMarkets from './api/bittrex/bittrexMarkets';
import BittrexTrades from './api/bittrex/bittrexTrades';
import Uniswap from './api/uniswap/uniswap';
import BigNumber from 'bignumber.js';

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

    let bittrexTrades = new BittrexTrades(store);
    let uniswap = new Uniswap(store);
   
    performSellBuyTx(bittrexTrades, uniswap);
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
        calculateSellBuyDeal(outputTokenAmount, sell[0]);
       
    }, 10);

    */
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
    calculateSellBuyDeal(outputTokenAmount, sell[0]);

}