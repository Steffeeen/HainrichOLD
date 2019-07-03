exports.permissionLevel = 1;
exports.description = "Changes the command prefix";
exports.args = "<prefix>";
exports.minArgs = 1;
exports.maxArgs = 1;

exports.run = (client, msg, args) => {
     if(!args || args.length < 1) {
          return msg.reply("You have to provide a new prefix");
     }

     const fs = require("fs");
     const config = require("../config.json");

     if(args[0].length === 1) {
          config.prefix = args[0];
          fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));

          msg.channel.send("Changed the command prefix to: " + args[0]);
     } else {
          msg.channel.send("Prefixes can only be one char");
     }
}
