const Discord = require('discord.js');
const {Client, RichEmbed} = require("discord.js");
const client = new Discord.Client();

const fs = require("fs");
const config = require("./config.json");

const ownerID = config.ownerID;
const modIDs = config.modIDs;

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith(config.prefix)) return;

    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log("Current command: " + command);

    let userPermissionLevel = 0;

    for(let i = 0; i < modIDs.length; i++) {
        if(modIDs[i] === msg.author.id) {
            userPermissionLevel = 1;
        }
    }

    if(msg.author.id === ownerID) userPermissionLevel = 100000;

    try {
        let commandFile = require("./commands/" + command + ".js");

        if(commandFile.permissionLevel <= userPermissionLevel) {
            commandFile.run(client, msg, args);
        } else {
            msg.channel.send("You don't have permission to use this command");
        }

    } catch(err) {
        msg.channel.send("Command not found");
        console.error(err);
    }
});