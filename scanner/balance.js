const { Load, Balance } = require("./binance");

module.exports = (request, response) => {
    const sort = request.query?.sort || "profit";
    const type = request.query?.type || "future";
    Load(type).then(async () => {
        return Balance().then(async (balance) => {
            response.json(balance);
        });
    }).catch((error) => {
        response.json(error);
    });
};