import { default as fetch } from 'node-fetch';
import { readableBalance } from '../../utils/index';

const API_KEY = 'FH3GFNFPYVJ4KRUCWBD45A7P3RSKJ8CEDW';
const BASE_URL = 'https://api.etherscan.io/api';

export default class Etherscan {
    constructor(store){
        this.store = store;
    }

    async getAccountBalance(tokenAddress, account){
        let url = `${BASE_URL}?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${account}&tag=latest&apikey=${API_KEY}`;
        let response = await fetch(url);
        let data = await response.json()
        return readableBalance(data.result);
    }
}