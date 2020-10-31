const {Client, Intents} = require('discord.js');
const client = new Client({ws: {intents: Intents.ALL}});
const fs = require("fs");

global.client = client;
global.config = require("./config.json");

// load .env file
const result = require("dotenv").config();

if (result.error) {
    throw result.error;
}

console.log(`Using tokens:`);
console.log(result.parsed);

const commandHandler = require("./commandhandler.js");

client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error(`There was an error logging in, info:\n${error}`);
    });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    global.musicplayer = require("./music/musicplayer.js");
    const musicplayerUI = require("./music/musicplayerUI");
    musicplayerUI.init();

    client.on("message", msg => onMessage(msg));
});

function onMessage(msg) {
    commandHandler.parseCommand(msg);
}

global.updateConfig = config => {
    global.config = config;
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), () => {
    });
}

global.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
};