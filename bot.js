const Discord = require('discord.js');
const client = new Discord.Client();

global.client = client;
global.config = require("./config.json");

// load .env file
const result = require("dotenv").config();

if (result.error) {
    throw result.error;
}

console.log(result.parsed);

const commandHandler = require("./commandhandler.js");

client.login(process.env.DISCORD_TOKEN);

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