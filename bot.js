const Discord = require('discord.js');
const client = new Discord.Client();

global.client = client;
global.config = require("./config.json");

const commandHandler = require("./commandhandler.js");

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    global.musicplayer = require("./music/musicplayer.js");

    client.on("message", msg => onMessage(msg));
});

function onMessage(msg) {
    commandHandler.parseCommand(msg);
}


global.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
};