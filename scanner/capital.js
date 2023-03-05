// API Documentation: https://open-api.capital.com

const axios = require("axios");

const Load = async (type = "demo") => {
    const subdomain = (type === "demo" ? "demo-api-capital" : "api-capital");
    const data = {
        identifier: process.env.CAPITAL_API_IDENTIFIER,
        password: process.env.CAPITAL_API_PASSWORD
    };
    const headers = {
        "X-CAP-API-KEY": process.env.CAPITAL_API_KEY,
        "X-SECURITY-TOKEN": "application/json"
    };
    const session = await axios.post(`https://${subdomain}.backend-capital.com/api/v1/session`, data, {
        headers
    });
    return {
        headers: {
            "CST": session?.headers["cst"],
            "X-SECURITY-TOKEN": session?.headers["x-security-token"]
        },
        host: session?.request?.host
    };
};

const Balance = async (data) => {
    const { headers, host } = data; if (!headers && !host) return;
    const accounts = await axios.get(`https://${host}/api/v1/accounts`, { headers });
    return accounts.data;
};

const Tickers = async (data, type = "forex") => {
    const markets = {
        forex: "hierarchy_v1.currencies.most_traded",
        indices: "hierarchy_v1.indices",
        commodities: "hierarchy_v1.commodities",
        oil: "hierarchy_v1.oil_markets_group.oil_markets",
        crypto: "hierarchy_v1.crypto_currencies",
        etf: "hierarchy_v1.etf_group.etf"
    };
    const { headers, host } = data; if (!headers && !host) return;
    const tickers = await axios.get(`https://${host}/api/v1/marketnavigation/${markets[type]}?limit=500`, { headers });
    return tickers.data;
};

const Prices = async (data, ticker, resolution = "DAY", period = 7) => {
    const { headers, host } = data; if (!headers && !host) return;
    const prices = await axios.get(`https://${host}/api/v1/prices/${ticker}?resolution=${resolution}&max=${period}`, { headers });
    return prices.data.prices.map((item) => {
        return {
            time: new Date(item.snapshotTime).getTime(),
            volume: item.lastTradedVolume,
            open: item.openPrice.bid,
            close: item.closePrice.bid,
            high: item.highPrice.bid,
            low: item.lowPrice.bid
        };
    });
};

const Positions = async (data) => {
    const { headers, host } = data; if (!headers && !host) return;
    const positions = await axios.get(`https://${host}/api/v1/positions`, { headers });
    return positions.data;
};

const Orders = async (data) => {
    const { headers, host } = data; if (!headers && !host) return;
    const positions = await axios.get(`https://${host}/api/v1/workingorders`, { headers });
    return positions.data;
};

module.exports = {
    Load,
    Balance,
    Tickers,
    Prices,
    Positions,
    Orders
};

/*
const Cancel = async () => {
    const orders = await Orders();
    return await Promise.all(orders.map(async (order) => {
            return await bybit?.cancelOrder(order.info.orderId, order.info.symbol);
        })).then(async () => {
        return await Positions().then(async (positions) => {
            return await Promise.all(positions.map(async (position) => {
                return await bybit?.createOrder(
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
    const quantity  = bybit?.amountToPrecision(ticker, amount / price);
    const stop      = bybit?.priceToPrecision(ticker, risk);
    const limit     = bybit?.priceToPrecision(ticker, reward);
    const side      = action === "long" ? "LONG" : "SHORT";
    return await bybit?.createOrder(
        ticker, "MARKET",
        action === "long" ? "BUY" : "SELL",
        quantity,
        undefined,
        { positionSide: side }
    ).then(async (order) => {
        return await bybit?.createOrder(
            ticker,
            "STOP_MARKET",
            order.side === "buy" ? "SELL" : "BUY",
            order.amount,
            stop,
            { positionSide: side, closePosition: true, stopPrice: stop }
        ).then(async () => {
            return await bybit?.createOrder(ticker,
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

// POSITION
const action = ((direction == "both" && (long || short)) || (direction == "long" && long) || (direction == "short" && short));
if (action) return await axios.get(`https://${type}.backend-capital.com/api/v1/positions`, { headers }).then(async (positions) => {
    const available = positions?.data.positions.filter((item) => item.direction === (long ? "SELL" : "BUY")).length === 1;
    const trades = positions?.data.positions.length;
    if ((available && hedge) || trades === 0) {
        const data = {
            direction: long ? "BUY" : "SELL",
            epic: asset,
            size: available ? amount * factor : amount,
            limitLevel: reward,
            stopLevel: (lossPercentShort > 0 && lossPercentLong > 0 ? risk : undefined)
        };
        return await axios.post(`https://${type}.backend-capital.com/api/v1/positions`, data, { headers }).then((position) => {
            console.log("done", { runtime, price, long, short, reward, risk, trades, data: position.config.data });
        });
    }
    console.log("log", { runtime, price, long, short, reward, risk, trades, data: close.filter((v, i, a) => i > a.length - 2 - 1) });
});
*/