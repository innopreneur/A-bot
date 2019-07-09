const signalR = require("@aspnet/signalr");
 
exports.connection = new signalR.HubConnectionBuilder()
    .withUrl("https://socket.bittrex.com/signalr")
    .build();
 
