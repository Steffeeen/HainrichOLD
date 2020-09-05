module.exports = {
    name: "moderator",
    description: "Manage the moderators",
    aliases: ["mod"],
    permissionLevel: 1,
    subcommands: [
        {
            name: "list",
            run: async (msg) => {
                let modNames = [];

                for (let modID of config.modIDs) {
                    let displayName = await client.users.fetch(config.modIDs[i]).toString();
                    modNames.push(displayName);
                }

                msg.channel.send("Mods: " + modNames.toString());
            }
        },
        {
            name: "add",
            run: (msg, args) => {
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
                updateConfig(config);
                msg.channel.send("User " + msg.mentions.members.first().displayName + " is now a mod");
            }
        },
        {
            name: "remove",
            run: (msg, args) => {
                let userID = 0;
                if (msg.mentions.members.first !== undefined) {
                    userID = msg.mentions.members.first().id;
                }

                for (let i = 0; i < config.modIDs.length; i++) {
                    if (config.modIDs[i] === userID) {
                        config.modIDs.splice(i, 1);
                        updateConfig(config);
                        msg.channel.send("User " + args[1] + " is no longer a mod");
                        return;
                    }
                }
                msg.channel.send("User not found");
            }
        }
    ],

    run(msg, args) {

    }
};