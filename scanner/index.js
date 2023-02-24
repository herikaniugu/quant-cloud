const { Load, Tickers, Candlesticks } = require("./binance");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    const sort = request.query?.sort || "profit";
    const type = request.query?.type || "future";
    Load(type).then(async () => {
        return Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Candlesticks(item.info.symbol).then(async (data) => {
                    if (data.length < 7) return;
                    const analysis = Analysis(data);
                    return Object.assign({ ticker: item.info.symbol }, analysis);
                });
            }));
            response.json(all.filter((item) => item).sort((a, b) => b[sort] - a[sort]));
        });
    }).catch((error) => {
        response.json(error);
    });
};