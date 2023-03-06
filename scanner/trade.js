const Exchange = require("./exchange");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    const exchange = request.query?.exchange || "binance";
    const { Load, Tickers, Prices, Trade } = Exchange(exchange);
    Load().then(async () => {
        return Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Prices(item.info.symbol).then(async (data) => {
                    if (data.length < 7) return;
                    const analysis = Analysis(data);
                    return Object.assign({ ticker: item.info.symbol }, analysis);
                });
            }));
            const array = all.filter((item) => {
                const position = ["long", "short"].indexOf(item.strategy.position) >= 0;
                return position && item.stability > 0.25 && item.volatility > 5 && item.inequality > 0.5 && item.inequality < 1.5;
            });
            return array.sort((a, b) => b.volatility - a.volatility).filter((value, index) => index < 5);
        }).then(async (tickers) => {
            console.log(tickers);
            return await Promise.all(tickers.map(async (each) => {
                const { position, trade } = each.strategy;
                return await Trade(each.ticker, position, trade.amount, trade.price, trade.stop, trade.limit);
            }));
        }).then((positions) => {
            response.json(positions);
        });
    }).catch((error) => {
        console.log(error);
        response.json(error);
    });
};