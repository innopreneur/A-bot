const SignalRClient = require('bittrex-signalr-client');
let client = new SignalRClient({
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

let watchPair = 'USDT-OCEAN';
let buyOrders = [], sellOrders = [];
let currentOrderSeq = 0;

//-- event handlers

client.on('trades', function(data){
    console.log('----------### Trades #####------------')
    //console.log(JSON.stringify(data));
});

//-- start subscription
console.log(`=== Subscribing to ${watchPair} trades`);
//client.subscribeToMarkets(['BTC-ETH']);
let connection = client.subscribeToMarkets([watchPair]);

//-- event handlers
client.on('ticker', function(data){
    console.log('----------**** Ticker *****------------')
    //console.log(JSON.stringify(data));
});

//-- start subscription
console.log(`=== Subscribing to ${watchPair} ticker`);
client.subscribeToTickers([watchPair]);


client.on('orderBook', function(data){
    console.log('----------^^^^^^^ Orderbook ^^^^^^------------')
    console.log(JSON.stringify(data)); 
    createOrderBook(data);  
});

client.on('orderBookUpdate', function(data){
    console.log('----------$$$$$$ Orderbook Updates $$$$$$$$------------')
    console.log(JSON.stringify(data));
    updateOrderBook(data);
});

function createOrderBook(orderbook){
    const {cseq, data, pair} = orderbook;
    const { buy, sell} =  data;

    //check if pair is correct
    if(pair !== watchPair){
        console.error(`Incorrect pair - ${pair}`);
        return;
    }

    //update sequence for updates
    currentOrderSeq = cseq;
    buyOrders = buy.slice();
    sellOrders = sell.slice();

    console.log(`Created a new orderbook for pair ${pair}`);
    console.log(`Buy orders  - ${JSON.stringify(buyOrders)}`);
    console.log(`Sell orders  - ${JSON.stringify(sellOrders)}`);
    
}


function updateOrderBook(update){
    
    const { cseq, data } = update;

    //validate and update sequence
    if(cseq != currentOrderSeq + 1) {
        console.error(`Incorrect sequence found. Expected ${currentOrderSeq + 1} but found ${cseq}.`);
    }
    else {
        currentOrderSeq++;
    }

    //find the update the order
    const { buy, sell } = data;

    //update BUY orders
    if(buy.length) {
        updateBuyOrder(buy[0])
        console.log(` ----- Updated (${currentOrderSeq}) BUY orders ---------`);
        console.log(buyOrders);
    }

    //update SELL orders
    if(sell.length) {
        updateSellOrder(sell[0])
        console.log(` ----- Updated (${currentOrderSeq}) SELL orders ---------`);
        console.log(sellOrders);
    }
    
}



function updateBuyOrder(newOrder) {
    console.log("Buy Orders Before update- " + JSON.stringify(buyOrders));
    switch (newOrder.action) {
        case 'remove':
            buyOrders = removeOrder(buyOrders, newOrder);
            break;
        case 'update':
            buyOrders = updateOrder(buyOrders, newOrder);
            break;
        case 'add':
            buyOrders = addOrder(buyOrders, newOrder);
            break;
    }
    console.log("Buy Orders After update- " + JSON.stringify(buyOrders));
    sortBuyOrders(buyOrders);
}

function updateSellOrder(newOrder) {
    console.log("SELL Orders Before update- " + JSON.stringify(sellOrders));
    switch (newOrder.action) {
        case 'remove':
            sellOrders = removeOrder(sellOrders, newOrder);
            break;
        case 'update':
            sellOrders = updateOrder(sellOrders, newOrder);
            break;
        case 'add':
            sellOrders = addOrder(sellOrders, newOrder);
            break;
    }
    console.log("SELL Orders After update- " + JSON.stringify(sellOrders));
    sortSellOrders(sellOrders);
}

function removeOrder(orders, newOrder){
    console.log(`Going to REMOVE order - ${JSON.stringify(newOrder)}`);
    let updatedOrders;
    //find order to remove
    let indexToRemove = findOrderIndex(orders, newOrder.rate);

    //remove order
    if (indexToRemove > -1) {
        updatedOrders = orders.splice(indexToRemove, 1);
        return updatedOrders;
      }
    
    return orders;
    
}

function updateOrder(orders, newOrder){
    console.log(`Going to UPDATE order - ${JSON.stringify(newOrder)}`);
    //find order to remove
    let indexToUpdate = findOrderIndex(orders, newOrder.rate);

    //update order quantity
    if (indexToUpdate > -1) {
        orders[indexToUpdate].quantity = newOrder.quantity;
      }
    
      return orders;
}

function addOrder(orders, newOrder) {
    console.log(`Going to ADD order - ${JSON.stringify(newOrder)}`);
    //add new order to list of orders
    orders.push(newOrder);
    return orders;
}


function findOrderIndex(orders, id){
    let foundOrder =  orders.find(function(order) {
        return id == order.rate;
    });

    //find index of order
    return orders.indexOf(foundOrder);
}

function sortSellOrders(orders){
    orders.sort(function (a, b) {
        return a.rate - b.rate;
      });
}

function sortBuyOrders(orders){
    orders.sort(function (a, b) {
        return b.rate - a.rate;
      });
}