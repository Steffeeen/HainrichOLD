module.exports = {
    name: "help",
    description: "shows help for a command",
    permissionLevel: 0,
    args: [
        {
            name: "command",
            type: "string",
            optional: true
        }
    ],
    run: (msg, args, info) => {
        if (args.command) {
            msg.channel.send(commandHandler.getCommandHelp(args.command, info.permissionLevel));
        } else {
            msg.channel.send(commandHandler.getHelp(info.permissionLevel));
        }
    }
}