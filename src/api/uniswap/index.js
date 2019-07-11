const Web3  = require('web3');
const BigNumber = require('bignumber.js');
const { readableBalance, amountFormatter, parseAmount, parseEth} = require('../../utils/formatter');
const exchangeABI = require('./abi/exchange');
const factoryABI = require('./abi/factory');
const tokenABI = require('./abi/token');
const { sendTx } = require('../../utils/signer');
import { FROM, FACTORY_ADDRESS, INFURA_NODE } from 'babel-dotenv';

//instantiate web3 provider
let web3 = new Web3(INFURA_NODE);

// denominated in bips
const ALLOWED_SLIPPAGE = web3.utils.toBN(200);
const TOKEN_ALLOWED_SLIPPAGE = web3.utils.toBN(400);
// denominated in seconds
const DEADLINE_FROM_NOW = 60 * 15;

export default class Uniswap {

  constructor(store){
    this.store = store;
  }

  /**
   * get pool size
   * @param {*} tokenSymbol 
   * @param {*} tokenAddress 
   */
  async getPoolSize(tokenSymbol, tokenAddress) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();
       
        const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

        const ethReserve = await web3.eth.getBalance(exchangeAddress);
        const tokenReserve = await tokenContract.methods.balanceOf(exchangeAddress).call();
        
        return {
            eth: readableBalance(ethReserve),
            token: readableBalance(tokenReserve),
            tokenSymbol
        }
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * get quote to sell tokens for ETH
   * @param {*} tokenAddress 
   * @param {*} sellAmount 
   */
  async getTokenSellQuote(tokenAddress, sellAmount) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();

        const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
        
        const outputReserve = await web3.eth.getBalance(exchangeAddress);
        const inputReserve = await tokenContract.methods.balanceOf(exchangeAddress).call();
        
        console.log(outputReserve, inputReserve);

        let bnSellAmount = new BigNumber(sellAmount);
        let bnOutputReserve = new BigNumber(outputReserve);
        let bnInputReserve = new BigNumber(inputReserve);
        let bn1000 = new BigNumber(1000);
        let bn997 = new BigNumber(997);

        // Output amount bought
        //let numerator =  bnSellAmount.multipliedBy(bnOutputReserve).multipliedBy(bn997);
        //let denominator = bnInputReserve.multipliedBy(bn1000).plus(bnSellAmount).multipliedBy(bn997);


        const inputAmountWithFee = bnSellAmount.multipliedBy(997)
        const numerator = inputAmountWithFee.multipliedBy(bnOutputReserve)
        const denominator = bnInputReserve.multipliedBy(1000).plus(inputAmountWithFee)
        const receivedEth = numerator.dividedToIntegerBy(denominator)


        //const receivedEth = numerator.dividedBy(denominator);
        console.log(receivedEth)
        return {
            receivedEth
        }
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * get quote to sell ETH for tokens
   */
  async getEthSellQuote(tokenAddress, sellAmount) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();
      
        const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
        
        const inputReserve = await web3.eth.getBalance(exchangeAddress);
        const outputReserve = await tokenContract.methods.balanceOf(exchangeAddress).call();
        
        console.log(outputReserve, inputReserve);

        let bnSellAmount = new BigNumber(sellAmount);
        let bnOutputReserve = new BigNumber(outputReserve);
        let bnInputReserve = new BigNumber(inputReserve);

        // Output amount bought
        //let numerator =  bnSellAmount.multipliedBy(bnOutputReserve).multipliedBy(997);
        //let denominator = bnInputReserve.multipliedBy(1000).plus(bnSellAmount).multipliedBy(997);

        const inputAmountWithFee = bnSellAmount.multipliedBy(997)
        const numerator = inputAmountWithFee.multipliedBy(bnOutputReserve)
        const denominator = bnInputReserve.multipliedBy(1000).plus(inputAmountWithFee)
        const receivedTokens = numerator.dividedToIntegerBy(denominator)

        //const receivedTokens = numerator.dividedBy(denominator);
        console.log(receivedTokens)
        return {
            receivedTokens
        }
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * get amount of Eth received for given amount of token sold
   * @param {*} tokenAddress 
   * @param {*} tokensSold 
   */
  async getTokenToEthInputPrice(tokenAddress, tokensSold) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();
        if(!exchangeAddress) {
          throw Error(`No exchange available for token - ${tokenAddress}`)
        }
        //instantiate exchange contract
        const exchangeContract = new web3.eth.Contract(exchangeABI, exchangeAddress);
        const ethBought = await exchangeContract.methods.getTokenToEthInputPrice(parseAmount(tokensSold)).call();
        console.log(`Eth Bought for ${tokensSold} tokens = ${readableBalance(ethBought)}`);
        const {minimum , maximum} = this._calculateSlippageBounds(ethBought, false);
        console.log(`Min Eth Bought for ${tokensSold} tokens = ${readableBalance(minimum)}`);
        return ethBought;
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * get amount of tokens received for given amount of ETH sold
   * @param {*} tokenAddress 
   * @param {*} ethSold 
   */
  async getEthToTokenInputPrice(tokenAddress, ethSold) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();
        if(!exchangeAddress) {
          throw Error(`No exchange available for token - ${tokenAddress}`)
        }
        //instantiate exchange contract
        const exchangeContract = new web3.eth.Contract(exchangeABI, exchangeAddress);
        const tokenBought = await exchangeContract.methods.getEthToTokenInputPrice(parseEth(ethSold)).call();
        console.log(`Token Bought for ${ethSold} ETH = ${readableBalance(tokenBought)}`);
        const {minimum , maximum} = this._calculateSlippageBounds(tokenBought, false);
        console.log(`Min Token Bought for ${ethSold} tokens = ${readableBalance(minimum)}`);
        return tokenBought;
        
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * get amount of ETH that needs to be sold for given amount of tokens bought
   * @param {*} tokenAddress 
   * @param {*} tokenBought 
   */
  async getEthToTokenOutputPrice(tokenAddress, tokenBought) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();

        //instantiate exchange contract
        const exchangeContract = new web3.eth.Contract(exchangeABI, exchangeAddress);
        const ethSold = await exchangeContract.methods.getEthToTokenOutputPrice(parseAmount(tokenBought)).call();
        console.log(`ETH Sold for ${tokenBought} Tokens = ${readableBalance(ethSold)}`);
        const {minimum , maximum} = this._calculateSlippageBounds(ethSold, false);
        console.log(`Max ETH Sold for ${tokenBought} Tokens = ${readableBalance(maximum)}`);
        return {
            tokenBought 
        }
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * get amount of tokens that needs to be sold for given amount of ETH bought
   * @param {*} tokenAddress 
   * @param {*} ethBought 
   */
  async getTokenToEthOutputPrice(tokenAddress, ethBought) {
    try {

        //instantiate factory contract
        const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);

        //get exchange address
        const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();

        //instantiate exchange contract
        const exchangeContract = new web3.eth.Contract(exchangeABI, exchangeAddress);
        const tokenSold = await exchangeContract.methods.getTokenToEthOutputPrice(parseAmount(ethBought)).call();
        console.log(`Tokens sold for ${ethBought} ETH = ${readableBalance(tokenSold)}`);
        const {minimum , maximum} = this._calculateSlippageBounds(tokenSold, false);
        console.log(`Max Tokens Sold for ${ethBought} ETH = ${readableBalance(maximum)}`);
        console.log(`Price change by ${((maximum - tokenSold)/ tokenSold) * 100} %`)
        return {
            ethBought 
        }
    }
    catch (err) {
        console.log(err.message);
    }
  }

  /**
   * add liquidity to an exchange for a given token address
   * @param {*} tokenAddress 
   * @param {*} maxTokenAmount 
   * @param {*} minLiquidity 
   * @param {*} ethAmount 
   * @param {*} deadline 
   */
  async addLiquidity(tokenAddress, maxTokenAmount, minLiquidity, ethAmount, deadline){
    try {
  
      //instantiate factory contract
      const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);
      
      //get exchange address
      //const exchangeAddress = await factoryContract.methods.getExchange(tokenAddress).call();
      //console.log(exchangeAddress)
      let exchangeAddress = '0x001c2063445Fff5c11C6aC3784F15F27CFCE6F29'
      //instantiate exchange contract
      const exchangeContract = new web3.eth.Contract(exchangeABI, exchangeAddress);
      const txData = await exchangeContract.methods.addLiquidity(minLiquidity, maxTokenAmount, deadline).encodeABI();
      //await sendTx(txData, FROM, exchangeAddress, 'FASTEST', ethAmount);
  }
  catch (err) {
      console.log(err.message);
  }
  }

  _calculateSlippageBounds(value, token = false) {
    if (value) {
      const bnValue = web3.utils.toBN(value);
      const offset = bnValue.mul(token ? web3.utils.toBN(TOKEN_ALLOWED_SLIPPAGE) : web3.utils.toBN(ALLOWED_SLIPPAGE)).div(web3.utils.toBN(10000));
      const minimum = bnValue.sub(offset);
      const maximum = bnValue.add(offset);
      const maxUint = web3.utils.toBN(2).pow(web3.utils.toBN(256)).sub(web3.utils.toBN(1));
      return {
        minimum: minimum.lt(0) ? 0 : minimum,
        maximum: maximum.gt(maxUint) ? maxUint : maximum
      }
    } else {
      return {}
    }
  }

  /**
   * Get amount of output tokens bought for a given amount of input tokens
   * @param {*} inputTokenAddress 
   * @param {*} outputTokenAddress 
   * @param {*} inputTokenAmount 
   */
  async getTokenToTokenInputPrice(inputTokenAddress, outputTokenAddress, inputTokenAmount){
    let ethReceived = await this.getTokenToEthInputPrice(inputTokenAddress, inputTokenAmount);
    let inputEth = readableBalance(ethReceived);
    let outputTokens = await this.getEthToTokenInputPrice(outputTokenAddress, inputEth);
    console.log(`Tokens - ${outputTokens}`)
    return readableBalance(outputTokens);
  }

  /**
   * get exchange for a given token address
   * @param {} tokenAddress 
   */
  async getExchange(tokenAddress) {
    //instantiate factory contract
    const factoryContract = new web3.eth.Contract(factoryABI, FACTORY_ADDRESS);
    return await factoryContract.methods.getExchange(tokenAddress).call();
  }

}















 /*
function getExchangeRate(inputValue, inputDecimals, outputValue, outputDecimals, invert = false) {
    try {
      if (
        inputValue &&
        (inputDecimals || inputDecimals === 0) &&
        outputValue &&
        (outputDecimals || outputDecimals === 0)
      ) {
        const factor = web3.utils.toBN(10).pow(web3.utils.toBN(18))
  
        if (invert) {
          return inputValue
            .mul(factor)
            .div(outputValue)
            .mul(web3.utils.toBN(10).pow(web3.utils.toBN(outputDecimals)))
            .div(web3.utils.toBN(10).pow(web3.utils.toBN(inputDecimals)))
        } else {
          return outputValue
            .mul(factor)
            .div(inputValue)
            .mul(web3.utils.toBN(10).pow(web3.utils.toBN(inputDecimals)))
            .div(web3.utils.toBN(10).pow(web3.utils.toBN(outputDecimals)))
        }
      }
    } catch {}
  }
  
  function getMarketRate(
    swapType,
    inputReserveETH,
    inputReserveToken,
    inputDecimals,
    outputReserveETH,
    outputReserveToken,
    outputDecimals,
    invert = false
  ) {
    if (swapType === ETH_TO_TOKEN) {
      return getExchangeRate(outputReserveETH, 18, outputReserveToken, outputDecimals, invert)
    } else if (swapType === TOKEN_TO_ETH) {
      return getExchangeRate(inputReserveToken, inputDecimals, inputReserveETH, 18, invert)
    } else if (swapType === TOKEN_TO_TOKEN) {
      const factor = web3.utils.toBN(10).pow(web3.utils.toBN(18))
      const firstRate = getExchangeRate(inputReserveToken, inputDecimals, inputReserveETH, 18)
      const secondRate = getExchangeRate(outputReserveETH, 18, outputReserveToken, outputDecimals)
      try {
        return !!(firstRate && secondRate) ? firstRate.mul(secondRate).div(factor) : undefined
      } catch {}
    }
  }

 
  function calculatePercentSlippage(){
    const percentSlippage =
    exchangeRate && marketRate
      ? exchangeRate
          .sub(marketRate)
          .abs()
          .mul(ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(18)))
          .div(marketRate)
          .sub(ethers.utils.bigNumberify(3).mul(ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(15))))
      : undefined
    const percentSlippageFormatted = percentSlippage && amountFormatter(percentSlippage, 16, 2)
  
  }
  */


