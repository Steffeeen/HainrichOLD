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
        const fs = require("fs");

        config.prefix = args.prefix;
        fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));

        msg.channel.send("Changed the command prefix to: " + args[0]);
    }
};