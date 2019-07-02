exports.permissionLevel = 0;
exports.run = (client, msg, args) => {
     msg.channel.send("------Help------");
     msg.channel.send("help: help");
     msg.channel.send("changeprefix: changeprefix <prefix>");
     msg.channel.send("mod: mod <list|add|remove> [user]");
     msg.channel.send("reload: reload <command>");
};
