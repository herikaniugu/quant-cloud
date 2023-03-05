const Exchange = require("./exchange");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    const type = request.query?.type || "future";
    const exchange = request.query?.exchange || "binance";
    const { Load, Tickers, Prices } = Exchange(exchange);
    Load(type).then(async () => {
        return Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Prices(item.info.symbol).then(async (data) => {
                    if (data.length < 7) return;
                    const analysis = Analysis(data, type);
                    return Object.assign({ ticker: item.info.symbol }, analysis);
                });
            }));
            const array = all.filter((item) => {
                return item.stability > 0.33 && item.volatility > 7.5 && item.inequality > 0.9 && item.inequality < 1.1;
            });
            return array.sort((a, b) => b.profit - a.profit).filter((value, index) => index < 5);
        }).then((tickers) => {
            response.json(tickers);
        });
    }).catch((error) => {
        console.log(error);
        response.json(error);
    });
    /*
    Load().then(async () => {
        return Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Prices(item.info.symbol).then(async (data) => {
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
    */
};