const Range = (data) => {
    return data.map((item) => (item.high / item.low) - 1);
};

const Mean = (range) => {
    return range.reduce((a, b) => a + b, 0) / range.length;
};

const Median = (range) => {
    if (range.length % 2 === 1) return range[(range.length - 1) / 2];
    return (range[(range.length / 2) - 1] + range[range.length / 2]) / 2;
};

const Direction = (data) => {
    const first         = data.find((item, index) => index === 0);
    const last          = data.find((item, index, array) => index === array.length - 1);
    const range         = first.low  < last.high && first.high > last.low;
    const uptrend       = first.low  > last.high;
    const downtrend     = first.high < last.low;
    return range ? "range" : (uptrend ? "uptrend" : (downtrend ? "downtrend" : "none"));
};

const Level = (data) => {
    const array         = data.filter((item, index) => index > 0);
    const price         = data.find((item, index) => index === 0).close;
    const resistance    = Math.max.apply(0, array.map((item) => item.high));
    const support       = Math.min.apply(0, array.map((item) => item.low));
    return { price, resistance, support };
};

const Normalize = (value) => {
    return value && isFinite(value) ? Math.round((value + Number.EPSILON) * 10000) / 10000 : 0;
};

const Backtest = (data, type) => {
    const input         = data.map((item, index, array) => array[array.length - 1 - index]), output = [];
    const high          = (id = 0) => input[id]?.high;
    const low           = (id = 0) => input[id]?.low;
    const open          = (id = 0) => input[id]?.open;
    const close         = (id = 0) => input[id]?.close;
    for (let id = 0; id < input.length; id++) {
        const short     = id > 0 && open(id - 1) < close(id - 1) && type == "future";
        const long      = id > 0 && open(id - 1) > close(id - 1);
        if (short && ((high(id - 1) / close(id - 1) - 1) * 100 < 2.5) && ((close(id - 1) / low(id - 1) - 1) * 100 > 5)) {
            const position = "short", stop = Math.max(high(id - 1), high(id - 1) + high(id - 1) * 0.25 / 100);
            const entry = open(id), exit = stop < high(id) ? stop : (low(id - 1) > low(id) ? low(id - 1) : close(id));
            const profit = Normalize((exit / entry - 1) * 100);
            output.push({ position, profit, entry, exit });
        }
        if (long && ((close(id - 1) / low(id - 1) - 1) * 100 < 2.5) && ((high(id - 1) / close(id - 1) - 1) * 100 > 5)) {
            const position = "long", stop = Math.min(low(id - 1), low(id - 1) - low(id - 1) * 0.25 / 100);
            const entry = open(id), exit = stop > low(id) ? stop : (high(id - 1) < high(id) ? high(id - 1) : close(id));
            const profit = Normalize((exit / entry - 1) * 100);
            output.push({ position, profit, entry, exit });
        }
    }
    return output.map((item, index, array) => array[array.length - 1 - index]);
};

module.exports = (data, type) => {
    const { price, resistance, support } = Level(data);
    const backtest  = Backtest(data, type);
    const direction = Direction(data);
    const condition = price < support ? "oversold" : (price > resistance ? "overbought" : "none");
    const profit    = backtest.map((item) => item.profit).reduce((a, b) => a + b, 0);
    const range     = Range(data);
    const mean      = Mean(range);
    const median    = Median(range);
    const min       = Math.min.apply(0, range);
    const max       = Math.max.apply(0, range);
    return {
        price,
        resistance,
        support,
        direction,
        condition,
        stability: Normalize(min / max),
        volatility: Normalize(mean * 100),
        inequality: Normalize(mean / median),
        profit,
        backtest
    };
};



/*
const Backtest = (data, type = "future") => {
    let win             = 0;
    let loss            = 0;
    const input         = data.map((item, index, array) => array[array.length - 1 - index]), output = [];
    const high          = (id = 0) => input[id]?.high;
    const low           = (id = 0) => input[id]?.low;
    const open          = (id = 0) => input[id]?.open;
    const close         = (id = 0) => input[id]?.close;
    const resistance    = (id) => {
        const gap       = (high(id - 1) / close(id - 1) - 1)   * 100;
        const min       = close(id - 1) + close(id - 1) * 1.25 / 100;
        const max       = close(id - 1) + close(id - 1) * 5    / 100;
        return gap < 1.25 ? min : (gap > 5 ? max : high(id - 1));
    };
    const support       = (id) => {
        const gap       = (close(id - 1) /   low(id - 1) - 1)   * 100;
        const min       =  close(id - 1) - close(id - 1) * 1.25 / 100;
        const max       =  close(id - 1) - close(id - 1) * 5    / 100;
        return gap < 1.25 ? min : (gap > 5 ? max : low(id - 1));
    };
    for (let id = 0; id < input.length; id++) {
        if (id > 0 && open(id - 1) < close(id - 1) && type == "future") {
            const position  = "Short";
            const status    = resistance(id) < high(id) ? "Stop Loss" : (low(id - 1) > low(id) ? "Take Profit" : "Close");
            const entry     = open(id);
            const exit      = status == "Take Profit" ? low(id - 1) : (status == "Stop Loss" ? resistance(id) : close(id));
            const profit    = Normalize((entry / exit - 1) * 100); if (profit > 0) win += 1; if (profit < 0) loss += 1;
            output.push({ position, status, profit, entry, exit });
        }
        if (id > 0 && open(id - 1) > close(id - 1)) {
            const position  = "Long";
            const status    = support(id) > low(id) ? "Stop Loss" : (high(id - 1) < high(id) ? "Take Profit" : "Close");
            const entry     = open(id);
            const exit      = status == "Take Profit" ? high(id - 1) : (status == "Stop Loss" ? support(id) : close(id));
            const profit    = Normalize((exit / entry - 1) * 100); if (profit > 0) win += 1; if (profit < 0) loss += 1;
            output.push({ position, status, profit, entry, exit });
        }
    }
    return { win, loss, trades: output.map((item, index, array) => array[array.length - 1 - index]) };
};
*/
