import { default as types } from '../constants/types';
import { PAIR } from 'babel-dotenv';

const initialState = {
    markets: [
           {
            pair: 'USDT-OCEAN',
            buyOrders: [],
            sellOrders: [],
            currentOrderSeq: 0          
            }
        ]
    }


export default function (state = initialState, action) {
    switch (action.type) {

        case types.CREATE_BUY_ORDERS :
          return Object.assign({}, state, {
            markets: state.markets.map((market) => {
                if(market.pair == PAIR) {
                    console.log('CREATE_BUY_ORDERS........')
                    return Object.assign({}, market, {
                        buyOrders: action.payload
                    })
                }
            })
          })

        case types.CREATE_SELL_ORDERS :
        return Object.assign({}, state, {
            markets: state.markets.map((market) => {
                if(market.pair == PAIR) {
                    console.log('CREATE_SELL_ORDERS........')
                    return Object.assign({}, market, {
                        sellOrders: action.payload
                    })
                }
            })
        }) 

        case types.ADD_BUY_ORDER :
            //let buyOrdersToAddTo = state.markets['USDT-OCEAN'].buyOrders;
            //buyOrdersToAddTo.push(action.payload);
            console.log(`ADD BUY ORDER - ${JSON.stringify(action.payload)}`)
            return Object.assign({}, state, {
                markets: state.markets.map((market) => {
                    if(market.pair == PAIR) {
                        let obj = Object.assign({}, market, {
                            buyOrders: market.buyOrders.push(action.payload).slice()
                        })
                        return obj
                    }
                })
            })
        
        case types.REMOVE_BUY_ORDER :
            //let buyOrdersToRemoveFrom = state.markets['USDT-OCEAN'].buyOrders;
            //let buyOrdersAfterRemoval = _removeOrder(buyOrdersToRemoveFrom, action.payload);
            console.log(`REMOVE BUY ORDER - ${JSON.stringify(action.payload)}`)
            return Object.assign({}, state, {
                markets: state.markets.map((market) => {
                    if(market.pair == PAIR) {
                        console.log(`BEFORE REMOVE --- ${market.buyOrders}`);
                        let obj = Object.assign({}, market, {
                            buyOrders: _removeOrder(market.buyOrders, action.payload)
                        })
                        console.log(`AFTER REMOVE --- ${obj}`);
                        return obj
                    }
                })
            })
        
        case types.UPDATE_BUY_ORDER :
            //let buyOrdersToUpdateTo = state.markets['USDT-OCEAN'].buyOrders;
            //let buyOrdersAfterUpdate = _updateOrder(buyOrdersToUpdateTo, action.payload);
            console.log(`UPDATE BUY ORDER - ${JSON.stringify(action.payload)}`)
            return Object.assign({}, state, {
                markets: state.markets.map((market) => {
                    if(market.pair == PAIR) {
                        let obj = Object.assign({}, market, {
                            buyOrders: _updateOrder(market.buyOrders, action.payload)
                        });
                        return obj;
                    }
                })
            })

        case types.ADD_SELL_ORDER :
            let sellOrdersToAddTo = state.markets['USDT-OCEAN'].sellOrders;
            sellOrdersToAddTo.push(action.payload);
        
            return Object.assign({}, state, {
                markets: {
                    'USDT-OCEAN': {
                        sellOrders: [...sellOrdersToAddTo]
                    }
                }
            })
            
        case types.REMOVE_SELL_ORDER :
            let sellOrdersToRemoveFrom = state.markets['USDT-OCEAN'].sellOrders;
            let sellOrdersAfterRemoval = _removeOrder(sellOrdersToRemoveFrom, action.payload);

            return Object.assign({}, state, {
                markets: {
                    'USDT-OCEAN': {
                        sellOrders: [...sellOrdersAfterRemoval]
                    }
                }
            })
        
        case types.UPDATE_SELL_ORDER :
            let sellOrdersToUpdateTo = state.markets['USDT-OCEAN'].sellOrders;
            let sellOrdersAfterUpdate = _updateOrder(sellOrdersToUpdateTo, action.payload);

            return Object.assign({}, state, {
                markets: {
                    'USDT-OCEAN': {
                        sellOrders: [...sellOrdersAfterUpdate]
                    }
                }
            })
        
        case types.UPDATE_CURRENT_SEQ :
            return Object.assign({}, state, {
                markets: state.markets.map((market) => {
                    if(market.pair == PAIR) {
                        
                        let obj = Object.assign({}, market, {
                            currentOrderSeq: action.payload
                        });
                        return obj;
                    }
                })
            })
        
        default:
          return state
      }
}


function _removeOrder(orders, newOrder){
    console.log(`Going to REMOVE order - ${JSON.stringify(newOrder)}`);
    console.log(`IN REMOVE BEFORE --- ${JSON.stringify(orders)}`);
    //find order to remove
    let indexToRemove = _findOrderIndex(orders, newOrder.rate);
    //remove order
    if (indexToRemove > -1) {
        orders.splice(indexToRemove, 1);
        console.log(`IN REMOVE AFTERRR --- ${JSON.stringify(orders)}`);
        return orders;
      }
    return orders;
}

function _updateOrder(orders, newOrder){
    console.log(`Going to UPDATE order - ${JSON.stringify(newOrder)}`);
    console.log(`BEFORE UPDATE - ${JSON.stringify(orders)}`)
    //find order to remove
    let indexToUpdate = _findOrderIndex(orders, newOrder.rate);
    //update order quantity
    if (indexToUpdate > -1) {
        orders[indexToUpdate].quantity = newOrder.quantity;
        console.log(`AFTER UPDATE - ${JSON.stringify(orders)}`)
      }
    return orders;
}




function _findOrderIndex(orders, id){
    let foundOrder =  orders.find(function(order) {
        return id == order.rate;
    });
    //find index of order
    return orders.indexOf(foundOrder);
}