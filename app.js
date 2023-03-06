const express = require("express");
const scanner = require("./scanner");
const leverage  = require("./scanner/leverage");
const balance = require("./scanner/balance");
const trade = require("./scanner/trade");
const test = require("./scanner/test");
const app = express();
const port = 8000;

require("dotenv").config();
process.env.TZ = "Africa/Dar_es_Salaam";
app.set("json spaces", 2);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/scanner", scanner);
app.use("/leverage", leverage);
app.use("/balance", balance);
app.use("/trade", trade);
app.use("/test", test);
app.use("/", (request, response) => {
    response.json({
        connected: process.env.BINANCE_API_KEY && process.env.BYBIT_API_KEY ? true : false,
        datetime: new Date()
    });
});

app.listen(port, () => {
    console.log("Server listening to port %s", port);
});
