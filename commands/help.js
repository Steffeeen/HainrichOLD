const helper = require("../helper.js");

module.exports = {
    name: "help",
    description: "Displays this help",
    aliases: [],
    permissionLevel: 0,
    args: [],
    run(client, msg, args) {
        if(args.length === 0) {
            msg.channel.send(helper.getHelp());
        } else {
            msg.channel.send(helper.getHelpMessage(args[0]));
        }
    }
};