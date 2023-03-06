const Exchange = require("./exchange");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    const exchange = request.query?.exchange || "binance";
    const { Load, Tickers, Leverage } = Exchange(exchange);
    Load().then(async () => {
        return await Tickers().then(async (tickers) => {
            return await Promise.all(tickers.map(async (item) => await Leverage(item.info.symbol)));
        });
    }).then(async (leverage) => {
        response.json(leverage);
    }).catch((error) => {
        console.log(error);
        response.json(error);
    });
};