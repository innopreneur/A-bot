import { default as types } from '../constants/types';

export function createBuyOrders(buyOrders){
    return {
        type: types.CREATE_BUY_ORDERS,
        payload: buyOrders
    }
}

export function createSellOrders(sellOrders){
    return {
        type: types.CREATE_SELL_ORDERS,
        payload: sellOrders
    }
}

export function updateBuyOrder(updates){
    return {
        type: types.UPDATE_BUY_ORDER,
        payload: updates
    }
}

export function removeBuyOrder(updates){
    return {
        type: types.REMOVE_BUY_ORDER,
        payload: updates
    }
}

export function addBuyOrder(updates){
    return {
        type: types.ADD_BUY_ORDER,
        payload: updates
    }
}

export function updateSellOrder(updates){
    return {
        type: types.UPDATE_SELL_ORDER,
        payload: updates
    }
}

export function removeSellOrder(updates){
    return {
        type: types.REMOVE_SELL_ORDER,
        payload: updates
    }
}

export function addSellOrder(updates){
    return {
        type: types.ADD_SELL_ORDER,
        payload: updates
    }
}

export function updateCurrentSeq(seq){
    return {
        type: types.UPDATE_CURRENT_SEQ,
        payload: seq
    }
}