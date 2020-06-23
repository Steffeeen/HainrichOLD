const Discord = require('discord.js');
const client = new Discord.Client();

global.client = client;

const commandHandler = require("./commandhandler.js");

global.config = require("./config.json");

client.commands = new Discord.Collection();

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    global.client = client;

    client.on("message", msg => onMessage(msg));
});

function onMessage(msg) {
    commandHandler.parseCommand(msg);

    /*if (config.textChannel === msg.channel.id) {
        if(msg.system) {
            msg.delete(1000);
        } else {
            let channel = msg.channel;
            let id = msg.id;
            let async = async () => {
                await sleep(4000);
                let message = await channel.messages.fetch(id);
                if (!message.pinned) {
                    if (message.author.bot) {
                        await message.delete({timeout: 10000});
                    } else {
                        await message.delete();
                    }
                }
            };
            async();
        }
    }*/
}


global.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
};