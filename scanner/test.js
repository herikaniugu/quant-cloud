const Exchange = require("./exchange");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    const exchange = request.query?.exchange || "binance";
    const { Load, Tickers, Prices } = Exchange(exchange);
    Load().then(async () => {
        return await Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Prices(item.info.symbol).then(async (data) => {
                    if (data.length < 7) return;
                    const analysis = Analysis(data);
                    return Object.assign({ ticker: item.info.symbol }, analysis);
                });
            }));
            const array = all.filter((item) => {
                const direction = item.strategy.direction === "range";
                const position = ["long", "short"].indexOf(item.strategy.trade.position) >= 0;
                return direction && position && item.stability > 0.25 && item.volatility > 5 && item.inequality > 0.5 && item.inequality < 1.5;
            });
            response.json(array.sort((a, b) => b.volatility - a.volatility).filter((value, index) => index < 5));
        });
    }).catch((error) => {
        console.log(error);
        response.json(error);
    });
};