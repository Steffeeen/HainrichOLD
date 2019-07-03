exports.permissionLevel = 1;
exports.description = "Clears the current chat";
exports.args = "<amount|all>";
exports.minArgs = 1;
exports.maxArgs = 1;

exports.run = (client, msg, args) => {
    if(msg.channel.type !== "text") {
        msg.channel.send("Not a text channel!");
        return;
    }

    if(args[0] === "all") {
        let amount = msg.channel.messages.size;
        let count = amount / 100;
        let cleared = 0;

        let promises = [];

        for(let i = 0; i < count + 1; i++) {
            promises.push(msg.channel.bulkDelete(100, true).then(messages => {cleared += messages.size;}));
        }
        Promise.all(promises).then(() => msg.channel.send(`Cleared ${cleared} messages`));
        return;
    }

    let amount = parseInt(args[0]);

    if(amount) {
        msg.channel.bulkDelete(amount, true).then(messages => msg.channel.send(`Cleared ${messages.size} messages`));
    } else {
        msg.channel.send("First argument has to be a number");
    }
};