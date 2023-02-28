const Exchange = require("./exchange");

module.exports = (request, response) => {
    const type = request.query?.type || "future";
    const exchange = request.query?.exchange || "binance";
    const { Load, Balance } = Exchange(exchange);
    Load(type).then(async () => {
        return Balance().then(async (balance) => {
            response.json(balance);
        });
    }).catch((error) => {
        console.log(error);
        response.json(error);
    });
};