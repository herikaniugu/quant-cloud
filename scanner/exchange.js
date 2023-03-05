const Binance = require("./binance");
const Bybit = require("./bybit");
const Capital = require("./capital");

module.exports = (type = "binance") => {
    switch (type) {
        case "binance":
            return Binance;
        case "bybit":
            return Bybit;
        case "capital":
            return Capital;
        default:
            return Binance;
    }
};