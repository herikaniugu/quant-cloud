const { coinspot } = require("ccxt");
const express = require("express");
const scanner = require("./scanner");
const balance = require("./scanner/balance");
const app = express();
const port = 8000;

require("dotenv").config();
process.env.TZ = "Africa/Dar_es_Salaam";
app.set("json spaces", 2);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/scanner", scanner);
app.use("/balance", balance);
app.use("/", (request, response) => {
    response.json({
        connected: process.env.BINANCE_API_KEY ? true : false,
        now: new Date()
    });
});

app.listen(port, () => {
    console.log("Server listening to port %s", port);
});
