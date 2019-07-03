exports.permissionLevel = 2;
exports.description = "Reloads the provided command";
exports.args = "<command>";
exports.minArgs = 1;
exports.maxArgs = 1;
exports.run = (client, msg, args) => {
     if(!args || args.length < 1) {
          return msg.channel.send("You have to provide a command to reload");
     }
     
     delete require.cache[require.resolve(`./${args[0]}.js`)];
     msg.channel.send("The command " + args[0] + " has been reloaded");
};
