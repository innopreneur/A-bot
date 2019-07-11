import { BOOK_PERCENT } from 'babel-dotenv';


function findBetterDeal(priceUniswap, tickerBittrex){
    const {result: {Bid, Ask}} = tickerBittrex;
    
    if(_calculatePercentageProfit(priceUniswap, Bid) >= BOOK_PERCENT){

        //Sell on Bittrex
        //Buy on Uniswap
        console.log(`| Uniswap(${priceUniswap}) - Bittrex(${Bid})| >= ${BOOK_PERCENT}%`);
        console.log('BUY on Uniswap ------ SELL on Bittrex');

        return 

    }
    else if(_calculatePercentageProfit(Ask, priceUniswap) >= BOOK_PERCENT){

        //Sell on Uniswap
        //Buy on Bittrex
        console.log(`| Uniswap(${priceUniswap}) - Bittrex(${Ask})| >= ${BOOK_PERCENT}%`);
        console.log('SELL on Uniswap ------ BUY on Bittrex');

    }
    else {
        console.log(`| Uniswap(${priceUniswap}) - Bittrex SELL (${Bid})| = ${_calculatePercentageProfit(priceUniswap, Bid)} <= ${BOOK_PERCENT}%`);
        console.log(`| Uniswap(${priceUniswap}) - Bittrex BUY (${Ask})| = ${_calculatePercentageProfit(Ask, priceUniswap)} <= ${BOOK_PERCENT}%`);

    }
}

/**
 * calculate SELL on UNISWAP and BUY on BITTREX Profitability
 * @param {*} priceUniswap 
 * @param {*} priceBittrex 
 */
function calculateSellBuyProfitability(priceUniswap, priceBittrex){
    const {Quantity, Rate} = priceBittrex;
    let _bittrex = Quantity * Rate;
    if(_calculatePercentageProfit(_bittrex, priceUniswap) >= BOOK_PERCENT){

        //Sell on Uniswap
        //Buy on Bittrex
        console.log(`| Uniswap(${priceUniswap}) - Bittrex(${_bittrex})| >= ${BOOK_PERCENT}%`);
        console.log('SELL on Uniswap ------ BUY on Bittrex');

        return 

    }
    
    else {
        console.log(`| Uniswap SELL (${priceUniswap}) - Bittrex BUY (${_bittrex})| = ${_calculatePercentageProfit(_bittrex, priceUniswap)} <= ${BOOK_PERCENT}%`);
    }
}

/**
 * calculate BUY on UNISWAP and SELL on BITTREX Profitability
 * @param {*} priceUniswap 
 * @param {*} priceBittrex 
 */
function calculateBuySellProfitability(priceUniswap, priceBittrex){
    const {Quantity, Rate} = priceBittrex;
    let _bittrex = Quantity * Rate;
    if(_calculatePercentageProfit(priceUniswap, _bittrex) >= BOOK_PERCENT){

        //Sell on Bittrex
        //Buy on Uniswap
        console.log(`| Bittrex SELL (${_bittrex}) - Uniswap BUY (${priceUniswap}) | >= ${BOOK_PERCENT}%`);
        console.log('BUY on Uniswap ------ SELL on Bittrex');

        return 

    }
    
    else {
        console.log(`| Uniswap(${priceUniswap}) - Bittrex SELL (${_bittrex})| = ${_calculatePercentageProfit(priceUniswap, _bittrex)} <= ${BOOK_PERCENT}%`);
    }
}

/**
 * calculate profit percentage based on cost and sold amounts
 * @param {} cost 
 * @param {*} sold 
 */
function _calculatePercentageProfit(cost, sold){
    return ((sold - cost)/cost) * 100;
}


module.exports = {
    findBetterDeal,
    calculateSellBuyProfitability,
    calculateBuySellProfitability
}