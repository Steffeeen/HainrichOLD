const clearChannel = require("../util/clearchannel");

module.exports = {
    name: "deepclear",
    description: "Clears the entire current chat",
    aliases: ["dc"],
    permissionLevel: 2,
    args: [],
    subcommands: [],

    async run(msg) {
        let channel = msg.channel;

        let cleared = await clearChannel(channel);

        channel.send("cleared " + cleared + " messages");
    }
};
