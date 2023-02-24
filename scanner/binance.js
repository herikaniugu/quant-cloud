const ccxt = require("ccxt");

let binance;

const Load = async (type = "future") => {
    binance = new ccxt.binance({
        apiKey: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_API_SECRET,
        options: {
            adjustForTimeDifference: true,
            defaultType: type,
            hedgeMode: type == "future" ? true : undefined
        }
    });
    return await binance.loadMarkets();
};

const Tickers = async (base = "USDT") => {
    return await binance?.fetchTickers().then((tickers) => {
        const data = Object.keys(tickers).filter((ticker) => ticker.endsWith(base)).map((key) => tickers[key]);
        return data.filter((ticker) => ticker.quoteVolume > 10000000).sort((a, b) => b.quoteVolume - a.quoteVolume);
    });
};

const Candlesticks = async (symbol, timeframe = "1d", period = 7) => {
    return await binance?.fetchOHLCV(symbol, timeframe, undefined, period).then((data) => {
        return data.map((item, index, array) => array[array.length - 1 - index]).map((value) => {
            return {
                timestamp: value[0],
                open:      value[1],
                high:      value[2],
                low:       value[3],
                close:     value[4],
                volume:    value[5]
            }
        });
    });
};

const Positions = async () => {
    return await binance?.fetchPositions().then((positions) => {
        return positions.filter((item) => item.contracts).sort((a, b) => b.contracts - a.contracts);
    });
};

const Orders = async () => {
    const orders = await Positions().then(async (positions) => {
        return await Promise.all(positions.map(async (position) => {
            return await binance?.fetchOpenOrders(position.info.symbol);
        }));
    });
    return Array.isArray(orders) ? [].concat.apply([], orders) : orders;
};

const Cancel = async () => {
    const orders = await Orders();
    return await Promise.all(orders.map(async (order) => {
            return await binance?.cancelOrder(order.info.orderId, order.info.symbol);
        })).then(async () => {
        return await Positions().then(async (positions) => {
            return await Promise.all(positions.map(async (position) => {
                return await binance?.createOrder(
                    position.info.symbol,
                    "MARKET",
                    position.side === "long" ? "SELL" : "BUY",
                    position.contracts,
                    undefined,
                    { positionSide: position.info.positionSide }
                );
            }));
        });
    });
};

const Trade = async (ticker, action, amount, price, risk, reward) => {
    const quantity  = binance?.amountToPrecision(ticker, amount / price);
    const stop      = binance?.priceToPrecision(ticker, risk);
    const limit     = binance?.priceToPrecision(ticker, reward);
    const side      = action === "long" ? "LONG" : "SHORT";
    return await binance?.createOrder(
        ticker, "MARKET",
        action === "long" ? "BUY" : "SELL",
        quantity,
        undefined,
        { positionSide: side }
    ).then(async (order) => {
        return await binance?.createOrder(
            ticker,
            "STOP_MARKET",
            order.side === "buy" ? "SELL" : "BUY",
            order.amount,
            stop,
            { positionSide: side, closePosition: true, stopPrice: stop }
        ).then(async () => {
            return await binance?.createOrder(ticker,
                "TAKE_PROFIT_MARKET",
                order.side === "buy" ? "SELL" : "BUY",
                order.amount,
                limit,
                { positionSide: side, closePosition: true, stopPrice: limit }
            ).then(() => {
                return order;
            });
        });
    });
};

module.exports = {
    Load,
    Tickers,
    Positions,
    Orders,
    Candlesticks,
    Trade,
    Cancel
};