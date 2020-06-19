module.exports = {
    name: "mod",
    description: "Manage the moderators",
    aliases: [],
    permissionLevel: 1,
    args: "<list|add|remove>",
    minArgs: 1,
    maxArgs: 2,
    /*subcommands: {
        list: function (client, msg, args) {
            const fs = require("fs");
            const config = require("../config.json");

            let modNames = [];
            for (let i = 0; i < config.modIDs.length; i++) {
                modNames[i] = client.users.get(config.modIDs[i]).toString();
            }
            msg.channel.send("Mods: " + modNames.toString());
        },
        add: function (client, msg, args) {
            const fs = require("fs");
            const config = require("../config.json");

            let userID = 0;
            if (msg.mentions.members.first !== undefined) {
                userID = msg.mentions.members.first().id;
            }

            for (let i = 0; i < config.modIDs.length; i++) {
                if (config.modIDs[i] === userID) {
                    msg.channel.send("User is already a mod");
                    return;
                }
            }
            config.modIDs[config.modIDs.length] = userID;
            msg.channel.send("User " + args[1] + " is now a mod");
            fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));
        },
        remove: function (client, msg, args) {
            const fs = require("fs");
            const config = require("../config.json");

            let userID = 0;
            if (msg.mentions.members.first !== undefined) {
                userID = msg.mentions.members.first().id;
            }

            for (let i = 0; i < config.modIDs.length; i++) {
                if (config.modIDs[i] === userID) {
                    config.modIDs.splice(i, 1);
                    msg.channel.send("User " + args[1] + " is no longer a mod");
                    fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));
                    return;
                }
            }
            msg.channel.send("User not found");
        }
    },*/
    run(client, msg, args) {

    }
};