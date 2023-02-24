const prediction = require("./prediction");

module.exports = (request, response) => {

    // TEAMS
    const teams = {
        "Geita": 0,
        "Ruvu": 1,
    };

    // SCORES
    const scores = [
        { team: { home: 1, away: 0 }, score: { home: 1, away: 2 } },
        { team: { home: 0, away: 1 }, score: { home: 2, away: 1 } },
    ];

    // PREDICTION
    const input = [teams["Geita"], teams["Ruvu"]];
    const output = prediction(scores, input);
    response.json({ teams, input, output });
};