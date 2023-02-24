const brain = require("brain.js");

module.exports = (scores, input) => {

    // INPUT
    const x = input[0];
    const y = input[1];

    // DATA
    const data = [];
    scores.forEach((each) => {
        const home = each.team.home;
        const away = each.team.away;
        const draw = each.score.home === each.score.away;
        const score = draw ? "draw" : (each.score.home > each.score.away ? "home" : "away");
        if ((x === home && y === away) || (y === home && x === away)) {
            data.push({
                input: [
                    home,
                    away
                ],
                output: [
                    score === "draw" ? 0 : (score === "home" ? 1 : 2)
                ]
            });
        }
    });

    // TRAIN
    const net = new brain.NeuralNetwork();
    net.train(data);

    // OUTPUT
    const output = net.run([x, y]);
    return output;
};