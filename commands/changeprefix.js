module.exports = {
    name: "changeprefix",
    description: "Change the command prefix",
    aliases: ["prefix"],
    permissionLevel: 1,
    args: [{
        name: "prefix",
        permissionLevel: 1,
        type: "char",
        run: function (client, msg, args) {
            const fs = require("fs");

            config.prefix = args[0];
            fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));

            msg.channel.send("Changed the command prefix to: " + args[0]);

        }
    }],
    run(client, msg, args) {

    }
};