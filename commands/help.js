const helper = require("../helper.js");

exports.permissionLevel = 0;
exports.description = "Displays this help";
exports.args = "[command]";
exports.minArgs = 0;
exports.maxArgs = 1;

exports.run = (client, msg, args) => {
     if(args.length === 0) {
         msg.channel.send(helper.getHelp());
     } else {
         msg.channel.send(helper.getHelpMessage(args[0]));
     }
};
