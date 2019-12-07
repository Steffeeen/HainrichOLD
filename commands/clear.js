const config = require("../config.json");

module.exports = {
    name: "clear",
    description: "Clears the current chat",
    aliases: ["c"],
    permissionLevel: 1,
    args: [{
        name: "amount",
        permissionLevel: 1,
        type: "int",
        min: 1,
        max: 100,
        run: function (client, msg, args) {
            msg.channel.bulkDelete(args[0], true).then(messages => {
                msg.channel.send(`Cleared ${messages.size} messages`);
                musicplayer.updateCurrentDisplay();
                musicplayer.updateQueueDisplay();
            });
        }
    }],
    subcommands: [{
        name: "all",
        aliases: ["a"],
        permissionLevel: 1,
        args: [],
        run: function (client, msg, args) {
            if (msg.channel.type !== "text") {
                msg.channel.send("Not a text channel!");
                return;
            }

            let amount = msg.channel.messages.size;
            console.log("messages amount: " + amount);
            let count = amount / 100;
            console.log(count);

            clearMessages(count, msg).then(cleared => {
                msg.channel.send(`Cleared ${cleared} messages`);
                global.queueUIReady = false;
                global.currentUIReady = false;
                musicplayer.updateCurrentDisplay();
                musicplayer.updateQueueDisplay();
            });
        }
    }],

    run(client, msg) {

    }
};

async function clearMessages(count, msg) {
    let cleared = 0;

    for (let i = 0; i < count + 1; i++) {
        await msg.channel.bulkDelete(100, true).then(messages => {
            cleared += messages.size;
        });
    }
    return cleared;
}