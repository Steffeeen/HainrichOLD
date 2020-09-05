module.exports = {
    name: "changeprefix",
    description: "Change the command prefix",
    aliases: ["prefix"],
    permissionLevel: 1,
    args: [{
        name: "prefix",
        type: "char",
    }],
    run(msg, args) {
        config.prefix = args.prefix;
        updateConfig(config);

        msg.channel.send("Changed the command prefix to: " + args[0]);
    }
};