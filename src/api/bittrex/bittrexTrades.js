const fetch = require("node-fetch");

let publicBaseUrl = 'https://api.bittrex.com/api/v1.1/public';

export default class BittrexTrades {

    constructor(store){
        this.store = store;
    }
    
    async getOrderbook(pair){
        let url = `${publicBaseUrl}/getorderbook?market=${pair}&type=both`;
        let response = await fetch(url);
        let data = await response.json()
        return data;
    }

    async getTicker(pair){
        let url = `${publicBaseUrl}/getticker?market=${pair}`;
        let response = await fetch(url);
        let data = await response.json()
        return data;
    }
}

