const Exchange = require("./exchange");
const Analysis = require("./analysis");

module.exports = (request, response) => {
    const direction = request.query?.direction;
    const type = request.query?.type || "future";
    const sort = request.query?.sort || "volatility";
    const exchange = request.query?.exchange || "binance";
    const { Load, Tickers, Candlesticks } = Exchange(exchange);
    Load(type).then(async () => {
        return Tickers().then(async (tickers) => {
            const all = await Promise.all(tickers.map(async (item) => {
                return await Candlesticks(item.info.symbol).then(async (data) => { // "15m", 24 * 4
                    if (data.length < 7) return;
                    const analysis = Analysis(data, type);
                    return Object.assign({ ticker: item.info.symbol }, analysis);
                });
            }));
            response.json(all.filter((item) => direction ? item?.direction == direction : item).sort((a, b) => b[sort] - a[sort]));
        });
    }).catch((error) => {
        console.log(error);
        response.json(error);
    });
};