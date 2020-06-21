module.exports = {
    name: "clear",
    description: "Clears the current chat, limited to messages that are not older than 14 days",
    aliases: ["c"],
    permissionLevel: 1,
    args: [{
        name: "amount",
        permissionLevel: 1,
        type: "positiveNumber",
        min: 1,
        max: 100
    }],
    subcommands: [{
        name: "all",
        aliases: ["a"],
        permissionLevel: 1,
        args: [],
        run: function (msg, args) {
            if (msg.channel.type !== "text") {
                msg.channel.send("Not a text channel!");
                return;
            }

            let amount = msg.channel.messages.holds;
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

    run(msg, args) {
        msg.channel.bulkDelete(args[0], true).then(messages => {
            msg.channel.send(`Cleared ${messages.size} messages`);
            musicplayer.updateCurrentDisplay();
            musicplayer.updateQueueDisplay();
        });
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