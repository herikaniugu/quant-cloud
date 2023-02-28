const Binance = require("./binance");
const Bybit = require("./bybit");

module.exports = (type = "binance") => {
    return type === "binance" ? Binance : Bybit;
};