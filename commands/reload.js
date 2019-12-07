module.exports = {
    name: "reload",
    description: "Reloads the provided command",
    aliases: [],
    permissionLevel: 2,
    args: "<command>",
    minArgs: 1,
    maxArgs: 1,
    run(client, msg, args) {
        if(!client.commands.has(args[0])) {
            return msg.channel.send("Command to reload was not found");
        }

        //Delete the require cache
        delete require.cache[require.resolve(`./${args[0]}.js`)];

        //Remove command from command list and readd it
        client.commands.delete(args[0]);
        const command = require(`../commands/${args[0]}.js`);
        client.commands.set(command.name, command);

        msg.channel.send("The command " + args[0] + " has been reloaded");
    }
};