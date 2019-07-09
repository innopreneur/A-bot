
import { BOOK_PERCENT } from 'babel-dotenv';

/*
function watchSellEth(tokenAddress, sellAmount, conditions){
    setInterval(async function(){
        console.log('getEthSellQuote ', sellAmount);
        let quote = await getEthToTokenInputPrice(tokenAddress, sellAmount);
        conditions.map(c => validateCondition(c, quote, 'eth'));
    }, 2000);
}

function watchSellToken(tokenAddress, sellAmount, conditions){
    setInterval(async function(){
        console.log('getTokenSellQuote ', sellAmount);
        let quote = await getTokenToEthInputPrice(tokenAddress, sellAmount);
        conditions.map(c => validateCondition(c, quote, 'token'));
    }, 2000);
}

function validateCondition(condition, quote, operatedOn){
    let { operation, outputAmount } = condition;
    let { receivedEth, receivedTokens} = quote;
    switch(operatedOn) {
        case 'token':
            if (operation == 'gt' && Number(receivedEth) >= Number(outputAmount)) {
                console.log("JACKPOT.........")
                console.log(`Will receive ${receivedEth} ETH which is greated than our expectation of ${outputAmount} `)
                console.log('Let sell it....');          
            }
        case 'eth': 
        if (operation == 'gt' && Number(receivedTokens) >= Number(outputAmount)) {
            console.log("JACKPOT.........")
            console.log(`Will receive ${receivedTokens} TOKENS which is greated than our expectation of ${outputAmount} `)
            console.log('Let sell it....');          
        }
    }
}
*/


function calculatePercentageProfit(cost, sold){
    return ((sold - cost)/cost) * 100;
}

function calculateMinimumPriceForProfitThreshold(priceUniswap, temp){
}

function findBetterDeal(priceUniswap, tickerBittrex){
    const {result: {Bid, Ask}} = tickerBittrex;
    
    if(calculatePercentageProfit(priceUniswap, Bid) >= BOOK_PERCENT){

        //Sell on Bittrex
        //Buy on Uniswap
        console.log(`| Uniswap(${priceUniswap}) - Bittrex(${Bid})| >= ${BOOK_PERCENT}%`);
        console.log('BUY on Uniswap ------ SELL on Bittrex');

        return 

    }
    else if(calculatePercentageProfit(Ask, priceUniswap) >= BOOK_PERCENT){

        //Sell on Uniswap
        //Buy on Bittrex
        console.log(`| Uniswap(${priceUniswap}) - Bittrex(${Ask})| >= ${BOOK_PERCENT}%`);
        console.log('SELL on Uniswap ------ BUY on Bittrex');

    }
    else {
        console.log(`| Uniswap(${priceUniswap}) - Bittrex SELL (${Bid})| = ${calculatePercentageProfit(priceUniswap, Bid)} <= ${BOOK_PERCENT}%`);
        console.log(`| Uniswap(${priceUniswap}) - Bittrex BUY (${Ask})| = ${calculatePercentageProfit(Ask, priceUniswap)} <= ${BOOK_PERCENT}%`);

    }
}

function calculateSellBuyDeal(priceUniswap, priceBittrex){
    const {Quantity, Rate} = priceBittrex;
    let _bittrex = Quantity * Rate;
    if(calculatePercentageProfit(_bittrex, priceUniswap) >= BOOK_PERCENT){

        //Sell on Uniswap
        //Buy on Bittrex
        console.log(`| Uniswap(${priceUniswap}) - Bittrex(${_bittrex})| >= ${BOOK_PERCENT}%`);
        console.log('SELL on Uniswap ------ BUY on Bittrex');

        return 

    }
    
    else {
        console.log(`| Uniswap SELL (${priceUniswap}) - Bittrex BUY (${_bittrex})| = ${calculatePercentageProfit(_bittrex, priceUniswap)} <= ${BOOK_PERCENT}%`);
    }
}

function calculateBuySellDeal(priceUniswap, priceBittrex){
    const {Quantity, Rate} = priceBittrex;
    let _bittrex = Quantity * Rate;
    if(calculatePercentageProfit(priceUniswap, _bittrex) >= BOOK_PERCENT){

        //Sell on Bittrex
        //Buy on Uniswap
        console.log(`| Bittrex SELL (${_bittrex}) - Uniswap BUY (${priceUniswap}) | >= ${BOOK_PERCENT}%`);
        console.log('BUY on Uniswap ------ SELL on Bittrex');

        return 

    }
    
    else {
        console.log(`| Uniswap(${priceUniswap}) - Bittrex SELL (${_bittrex})| = ${calculatePercentageProfit(priceUniswap, _bittrex)} <= ${BOOK_PERCENT}%`);
    }
}
module.exports = {
    findBetterDeal,
    calculateSellBuyDeal,
    calculateBuySellDeal
}