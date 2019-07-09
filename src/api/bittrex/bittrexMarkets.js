const SignalRClient = require('bittrex-signalr-client');
import { 
        createBuyOrders, 
        createSellOrders, 
        addBuyOrder, 
        addSellOrder,
        updateBuyOrder,
        updateSellOrder,
        removeBuyOrder,
        removeSellOrder,
        updateCurrentSeq        
    } from '../../actions';

export default class BittrexMarkets {
    constructor(store) {
        this.store = store;
        this.client = this.initiateClient();
    }

    initiateClient(){
       return new SignalRClient({
            // websocket will be automatically reconnected if server does not respond to ping after 10s
            pingTimeout:10000,
            watchdog:{
                // automatically reconnect if we don't receive markets data for 30min (this is the default)
                markets:{
                    timeout:1800000,
                    reconnect:true
                }
            },
            // use cloud scraper to bypass Cloud Fare (default)
            useCloudScraper:true
        });
    }

    subscribeToMarkets(pairs) {
        this.client.subscribeToMarkets([...pairs]);
    }


    
    createOrderBook(orderbook) {
        const {cseq, data, pair} = orderbook;
        const { buy, sell} =  data;
    
        //check if pair is correct
        if(pair !== process.env.PAIR){
            console.error(`Incorrect pair - ${pair}`);
            return;
        }
    
        //update sequence for updates
        this.store.dispatch(updateCurrentSeq(cseq));
        this.store.dispatch(createBuyOrders(buy));
        this.store.dispatch(createSellOrders(sell));
    
        console.log(`Created a new orderbook for pair ${pair}`);        
    }


    updateOrderBook(update){
        const { cseq, data } = update;
        let currentOrderSeq =  parseInt(this.store.getState().markets[0].currentOrderSeq);
        //validate and update sequence
        if(cseq != currentOrderSeq + 1) {
            console.error(`Incorrect sequence found. Expected ${currentOrderSeq + 1} but found ${cseq}.`);
        }
        else {
            this.store.dispatch(updateCurrentSeq(cseq));
        }

        //find the update the order
        const { buy, sell } = data;

        //update BUY orders
        if(buy.length) {
            this._updateBuyOrder(buy[0])
        }

        //update SELL orders
        if(sell.length) {
                //this._updateSellOrder(sell[0])
        }
    }

    _updateBuyOrder(newOrder) {
       
        switch (newOrder.action) {
            case 'remove':
                this.store.dispatch(removeBuyOrder(newOrder));
                break;
            case 'update':
                this.store.dispatch(updateBuyOrder(newOrder));
                break;
            case 'add':
                this.store.dispatch(addBuyOrder(newOrder));
                break;
        }
        //sortBuyOrders(this.store.getState().markets[0].buyOrders);
    }
    
    _updateSellOrder(newOrder) {
        switch (newOrder.action) {
            case 'remove':
                this.store.dispatch(removeSellOrder(newOrder));
                break;
            case 'update':
                this.store.dispatch(updateSellOrder(newOrder));
                break;
            case 'add':
                this.store.dispatch(addSellOrder(newOrder));
                break;
        }
        
        //sortSellOrders(sellOrders);
    }
    
    handleOrderBookCreationEvent(){
        this.client.on('orderBook', this.createOrderBook.bind(this)); 
    }
    
    handleOrderBookUpdateEvent(){
        this.client.on('orderBookUpdate', this.updateOrderBook.bind(this));
    }
    
    sortSellOrders(orders){
        orders.sort(function (a, b) {
            return a.rate - b.rate;
        });
    }
    
    sortBuyOrders(orders){
        orders.sort(function (a, b) {
            return b.rate - a.rate;
        });
    }
}






