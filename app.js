const ccxt = require("ccxt");
const express = require("express");
const scanner = require("./scanner");
const trade = require("./scanner/trade");
const soccer = require("./soccer");
const stock = require("./stock");
const app = express();
const port = 8000;

require("dotenv").config();
app.set("json spaces", 2);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/scanner", scanner);
app.use("/soccer", soccer);
app.use("/stock", stock);
app.use("/trade", trade);
app.use("/", (request, response) => {
    response.json({ connected: process.env.BINANCE_API_KEY ? true : false });   
});

app.listen(port, () => {
    console.log("Server listening to port %s", port);
});
