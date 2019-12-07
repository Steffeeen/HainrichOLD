const Discord = require('discord.js');
const client = new Discord.Client();
const helper = require("./helper.js");

const fs = require("fs");
const config = require("./config.json");

client.commands = new Discord.Collection();

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    global.client = client;
    loadCommands();

    client.on("message", msg => onMessage(msg));
});

function onMessage(msg) {
    parseCommand(msg);

    if (config.textChannel === msg.channel.id) {
        if(msg.system) {
            msg.delete(1000);
        } else {
            let channel = msg.channel;
            let id = msg.id;
            let a = async () => {
                await sleep(4000);
                let message = await channel.fetchMessage(id);
                if (!message.pinned) {
                    if (message.author.bot) {
                        message.delete(10000);
                    } else {
                        message.delete();
                    }
                }
            };
            a();
        }
    }
}

function loadCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        client.commands.set(command.name, command);
    }
}

//takes the message, parses it and executes the command
function parseCommand(msg) {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(config.prefix)) return;

    //Get args and command name
    const messageArgs = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const commandName = messageArgs.shift().toLowerCase();

    console.log("Current command: " + commandName);

    let command = client.commands.get(commandName);

    //check for aliases
    if (!command) {
        for (let cmd of client.commands) {
            if (cmd[1].aliases.includes(commandName)) {
                command = cmd[1];
            }
        }
    }

    if (!command) {
        msg.channel.send("Command not found");
        return;
    }

    //permissions
    let userPermissionLevel = 0;
    for (let i = 0; i < config.modIDs.length; i++) {
        if (config.modIDs[i] === msg.author.id) {
            userPermissionLevel = 1;
        }
    }
    if (msg.author.id === config.ownerID) userPermissionLevel = 100000;

    if (command.permissionLevel > userPermissionLevel) {
        msg.channel.send("You don't have permission to use this command");
        return;
    }

    //no args
    let argsNeeded = false;
    for (let arg of command.args) {
        if (!arg.optional) {
            argsNeeded = true;
        }
    }
    if (command.args.length === command.subcommands.length === 0 && !argsNeeded) {
        try {
            command.noArgs(client, msg);
        } catch (e) {
            console.error(e);
        }
    }

    //sub command handling
    for (let subcmd of command.subcommands) {
        let valid = subcmd.aliases;
        valid.push(subcmd.name);

        for (let item of valid) {
            if (messageArgs[0] !== item) {
                continue;
            }

            if (subcmd.permissionLevel > userPermissionLevel) {
                msg.channel.send("You don't have permission to use this sub command");
                return;
            }
            messageArgs.shift();

            //sub command args
            let result = checkArgs(subcmd.args, messageArgs, userPermissionLevel);

            if (typeof result === "string") {
                msg.channel.send(result);
            } else {
                subcmd.run(client, msg, result);
            }
            return;
        }
    }

    if (command.args.length === 0) {
        msg.channel.send("Sub command not found!");
    }

    //args handling
    let result = checkArgs(command.args, messageArgs, userPermissionLevel);

    if (typeof result === "string") {
        msg.channel.send(result);
    } else {
        command.run(client, msg, result);
    }
}

//Compares the provided args with the required args
function checkArgs(args, messageArgs, userPermissionLevel) {
    let returnObj = {};

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        let messageArg = messageArgs[i];

        //No more message args, but more a required
        if (!messageArg && !arg.optional) {
            return `Missing arguments: ${args.slice(i).toString()}`;
        }

        let prefix = `${messageArg}:`;

        let item;

        if (arg.permissionLevel > userPermissionLevel) {
            return `${prefix} You don't have permission to use this argument`;
        }

        switch (arg.type) {
            case "int":
                let int = parseInt(messageArg);
                if (!int) {
                    return `${prefix} The argument provided must be an integer`;
                }
                item = int;
                break;

            case "float":
                let float = parseFloat(messageArg);
                if (!float) {
                    return `${prefix} The argument provided must be a decimal number (a.b)`;
                }

                item = float;
                break;

            case "string":
                item = messageArg;
                break;

            case "range":
                let range = messageArg.split("-");
                if (range.length !== 2) {
                    return `${prefix} The argument provided must be a range (a-b)`;
                }

                let min = Math.min(range[0], range[1]);
                let max = Math.max(range[0], range[1]);

                if(min && max) {
                    item = {min: min, max: max};
                }
                break;

            case "list":
                let items = messageArg.split(",");

                if (items.length <= 0) {
                    return `${prefix} The argument provided must be a list (a,b,c)`;
                }

                item = items;
                break;

            case "searchquery":
                let query = "";

                for (let j = i; j < messageArgs.length; j++) {
                    query += messageArgs[j];
                }

                item = query;
                break;
        }
        /*
        if (arg.type === "int") {
            let int = parseInt(messageArg);
            if(!int) {
                return `${prefix} The argument provided must be an integer`;
            }
            item = int;
        } else if (arg.type === "float") {
            let float = parseFloat(messageArg);
            if (!float) {
                return `${prefix} The argument provided must be a decimal number (a.b)`;
            }

            item = float;
        } else if (arg.type === "string") {
            item = messageArg;
        } else if (arg.type === "range") {
            let range = messageArg.split("-");
            if(range.length !== 2) {
                return `${prefix} The argument provided must be a range (a-b)`;
            }

            item = {min: Math.min(range[0], range[1]), max: Math.max(range[0], range[1])};
        } else if (arg.type === "list") {
            let items = messageArg.split(",");

            if(items.length <= 0) {
                return `${prefix} The argument provided must be a list (a,b,c)`;
            }

            item = items;
        }*/
        let valid = arg.validate(messageArg);

        if (typeof valid === "string") {
            return valid;
        }

        returnObj = Object.defineProperty(returnObj, arg.name, {value: item});
    }

    return returnObj;
}

global.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
};