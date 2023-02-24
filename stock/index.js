const brain = require("brain.js");

module.exports = (request, response) => {

    // INPUT
    const input = [[317, 323, 332, 330, 327, 324, 333, 328, 306, 305, 328, 306, 305, 310, 312, 294]];

    // TRAIN
    const net = new brain.recurrent.LSTMTimeStep();
    net.train(input);

    // OUTPUT
    const output = net.run([317, 323, 332, 330, 327, 324, 333]);

    response.json({ input, output});

    /*
    // INPUT
    const input = [[1, 317], [2, 323], [3, 332], [4, 330], [5, 327], [6, 324], [7, 333]];
    //, 328, 306, 305, 310, 312, 294]];

    // TRAIN
    const net = new brain.recurrent.LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2
    });
    net.train(input); //, { log: true, errorThresh: 0.09 });

    // OUTPUT
    const output = net.forecast(input, 2);

    response.json({ input, output});
    */
};
