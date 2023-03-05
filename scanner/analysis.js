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
    const supply        = resistance - (resistance - support) / 4;
    const demand        = support + (resistance - support) / 4;
    return { price, resistance, support, supply, demand };
};

const Normalize = (value) => {
    return value && isFinite(value) ? Math.round((value + Number.EPSILON) * 10000) / 10000 : 0;
};

const Backtest = (data, type) => {
    const { supply, demand } = Level(data);
    const input         = data.map((item, index, array) => array[array.length - 1 - index]), output = [];
    const open          = (id = 0) => input[id]?.open;
    const close         = (id = 0) => input[id]?.close;
    for (let id = 0; id < input.length; id++) {
        const entry     = open(id);
        const exit      = close(id);
        const peak      = open(id - 1) < close(id - 1);
        const trough    = open(id - 1) > close(id - 1);
        if (id > 0 && peak && entry > supply && type == "future") {
            output.push({
                position: "short",
                profit: Normalize((entry / exit - 1) * 100),
                entry,
                exit
            });
        }
        if (id > 0 && trough && entry < demand) {
            output.push({
                position: "long",
                profit: Normalize((exit / entry - 1) * 100),
                entry,
                exit
            });
        }
    }
    return output.map((item, index, array) => array[array.length - 1 - index]);
};


module.exports = (data, type) => {
    const { price, resistance, supply, demand, support } = Level(data);
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
        supply,
        demand,
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
