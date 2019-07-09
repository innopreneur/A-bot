const BigNumber =  require('bignumber.js');
const Web3  = require('web3');
const web3 = new Web3(process.env.INFURA_NODE);

let fmt = {
  prefix: '',
  decimalSeparator: '',
  groupSeparator: '',
  groupSize: 0,
  secondaryGroupSize: 0,
  fractionGroupSeparator: '',
  fractionGroupSize: 0,
  suffix: ''
}

// Set the global formatting options
BigNumber.config({ FORMAT: fmt })


//make amount to readable format
exports.readableBalance = (preformattedAmount) => {
    let bn =  new BigNumber(Number(preformattedAmount));
    let tokenUnit = new BigNumber(10);
    tokenUnit = tokenUnit.exponentiatedBy(-18);
    return (bn.multipliedBy(tokenUnit)).toPrecision();

}
exports.parseEth = (eth) => {
  return web3.utils.toWei(eth, 'ether');
}

//helper function to parse amount from csv and convert into ERC-20 token's 18 decimal digit
exports.parseAmount = (preformattedAmount) => {
  let bn =  new BigNumber(Number(preformattedAmount));
  let tokenUnit = new BigNumber(10);
  tokenUnit = tokenUnit.pow(18);
  let value = (bn.multipliedBy(tokenUnit)).toFormat(0);
  return value;
}

//helper function to parse amount from csv and convert into ERC-20 token's 18 decimal digit
 exports.parseAmountssss = (amount) => {
  // Decimal
  const decimals = web3.utils.toBN(18);

  // Amount of token
  const tokenAmount = web3.utils.toBN(Number(amount));

  // Amount as Hex - contract.methods.transfer(toAddress, tokenAmountHex).encodeABI();
  const tokenAmountHex = '0x' + tokenAmount.mul(web3.utils.toBN(10).pow(decimals)).toString('hex');

  return tokenAmountHex;

}

/*
// amount must be a BigNumber, {base,display} Decimals must be Numbers
exports.amountFormatter = (amount, baseDecimals = 18, displayDecimals = 3, useLessThan = true) => {
    if (baseDecimals > 18 || displayDecimals > 18 || displayDecimals > baseDecimals) {
      throw Error(`Invalid combination of baseDecimals '${baseDecimals}' and displayDecimals '${displayDecimals}.`)
    }
  
    // if balance is falsy, return undefined
    if (!amount) {
      return undefined
    }
    // if amount is 0, return
    else if (amount.isZero()) {
      return '0'
    }
    // amount > 0
    else {
      // amount of 'wei' in 1 'ether'
      const baseAmount = ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(baseDecimals))
  
      const minimumDisplayAmount = baseAmount.div(
        ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(displayDecimals))
      )
  
      // if balance is less than the minimum display amount
      if (amount.lt(minimumDisplayAmount)) {
        return useLessThan
          ? `<${ethers.utils.formatUnits(minimumDisplayAmount, baseDecimals)}`
          : `${ethers.utils.formatUnits(amount, baseDecimals)}`
      }
      // if the balance is greater than the minimum display amount
      else {
        const stringAmount = ethers.utils.formatUnits(amount, baseDecimals)
  
        // if there isn't a decimal portion
        if (!stringAmount.match(/\./)) {
          return stringAmount
        }
        // if there is a decimal portion
        else {
          const [wholeComponent, decimalComponent] = stringAmount.split('.')
          const roundUpAmount = minimumDisplayAmount.div(ethers.constants.Two)
          const roundedDecimalComponent = ethers.utils
            .bigNumberify(decimalComponent.padEnd(baseDecimals, '0'))
            .add(roundUpAmount)
            .toString()
            .padStart(baseDecimals, '0')
            .substring(0, displayDecimals)
  
          // decimals are too small to show
          if (roundedDecimalComponent === '0'.repeat(displayDecimals)) {
            return wholeComponent
          }
          // decimals are not too small to show
          else {
            return `${wholeComponent}.${roundedDecimalComponent.toString().replace(/0*$/, '')}`
          }
        }
      }
    }
  } */