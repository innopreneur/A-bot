import { default as fetch } from 'node-fetch';

const API_KEY = 'da9ca3df-525e-4138-acd8-4b297f17cd46';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1'; //cryptocurrency/listings/latest'

export default class CoinMarketCap {
    constructor(store){
        this.store = store;
    }

    async getCryptoListings(){
        let url = `${BASE_URL}/cryptocurrency/listings/latest?start=1&limit=5000&convert=USD`;
        let response = await fetch(url, { headers: { 'X-CMC_PRO_API_KEY': API_KEY }});
        let data = await response.json()
        return data;
    }
}

