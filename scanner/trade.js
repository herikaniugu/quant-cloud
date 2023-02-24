const { Load, Tickers, Candlesticks } = require("./binance");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    Load().then(async () => {
        return Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Candlesticks(item.info.symbol).then(async (data) => {
                    if (data.length < 7) return;
                    const analysis = Analysis(data);
                    return Object.assign({ ticker: item.info.symbol }, analysis);
                });
            }));
            // return await Cancel().then(() => all.filter((item) => item).sort((a, b) => b.profit - a.profit).filter((value, index) => index < 5));
            return all.filter((item) => item).sort((a, b) => b.profit - a.profit).filter((value, index) => index < 5);
        }).then(async (tickers) => {
            // return await Promise.all(tickers.map(async (ticker) => {
            //     return await Trade("BTCUSDT", "long", 26, 24606, 24000, 25000);
            // }));
            // return tickers;
        }).then((tickers) => {
            response.json(tickers);
        });
    }).catch((error) => {
        response.json(error);
    });
};