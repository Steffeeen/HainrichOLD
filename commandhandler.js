const parser = require("./parser");
const fs = require("fs");

const VOICE_CHANNEL_ID_REGEX = /(?:^<#)(\d{18})(?:>$)/;

let commands = [];

loadCommands();

// takes the message, parses it and executes the command
async function parseCommand(msg) {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(config.prefix)) return;

    //Get args and command name
    const messageArgs = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const commandName = messageArgs.shift().toLowerCase();

    let command = getCommand(commandName);

    // no command or alias found
    if (!command) {
        msg.channel.send("Command not found");
        return;
    }

    let userPermissionLevel = getPermissionLevel(msg);

    console.log(`Required permission level: ${command.permissionLevel}, user permission level: ${userPermissionLevel}`);

    if (command.permissionLevel > userPermissionLevel) {
        msg.channel.send("You don't have permission to use this command");
        return;
    }

    let subCmdResult;

    try {
        subCmdResult = getSubCommand(command, messageArgs, userPermissionLevel);
    } catch (e) {
        // error if the user doesn't have sufficient permissions
        console.log("error getting sub command");
        msg.channel.send(e.toString());
        return;
    }

    command = subCmdResult.command;
    let args = subCmdResult.args;

    try {
        args = mergeQuery(args);
    } catch (e) {
        msg.channel.send(e.toString());
    }

    console.log(`command is ${command.name} after sub command check, args are: ${args.toString()}`);

    let argsObject;

    let sliceIndex;

    try {
        let {returnObj, slice} = await checkArgs(command.args, args, userPermissionLevel, msg.member);
        argsObject = returnObj;
        sliceIndex = slice;
    } catch (e) {
        msg.channel.send(e.toString());
        console.log(e);
        return;
    }

    try {
        parseFlags(command, args.slice(sliceIndex), argsObject);
    } catch (e) {
        msg.channel.send(e.toString());
        return;
    }

    command.run(msg, argsObject);
}

// gets the base command
function getCommand(commandName) {
    console.log("Command input: " + commandName);

    let command = commands.find(cmd => cmd.name === commandName);

    if (command) {
        console.log("Found command: " + command.name);
        return command;
    }

    //check for aliases
    for (let cmd of commands) {
        if (cmd.aliases && cmd.aliases.includes(commandName)) {
            console.log(`Found command ${cmd.name} with alias ${commandName}`);
            return cmd;
        }
    }

    return null;
}

// get the permission level for the command sender
function getPermissionLevel(msg) {
    let userPermissionLevel = 0;

    if (msg.author.id === config.ownerID) userPermissionLevel = 100000;

    if (config.modIDs.includes(msg.author.id)) {
        userPermissionLevel = 1;
    }

    return userPermissionLevel;
}

// check for valid sub commands
function getSubCommand(command, args, userPermissionLevel) {
    let newCommand = command;

    let subCmdName = args[0];

    let prevSubCmd = newCommand;

    while (newCommand.subcommands) {
        for (let subCmd of newCommand.subcommands) {
            if (subCmd.name === subCmdName || (subCmd.aliases && subCmd.aliases.includes(subCmdName))) {
                if (subCmd.permissionLevel && subCmd.permissionLevel > userPermissionLevel) {
                    throw "You don't have permission to use this sub command";
                }

                prevSubCmd = newCommand;
                newCommand = subCmd;
                args.shift();
                subCmdName = args[0];
                break;
            }
        }

        // no new sub command was found, stop searching
        if (prevSubCmd === newCommand) {
            break;
        }
    }

    return {command: newCommand, args: args};
}

// compares the provided args with the required args
async function checkArgs(requiredArgs, actualArgs, userPermissionLevel, member) {
    let returnObj = {};
    let sliceIndex = 0;

    if (!requiredArgs) {
        return returnObj;
    }

    for (let i = 0; i < requiredArgs.length; i++) {
        let requiredArg = requiredArgs[i];
        let actualArg = actualArgs[i];

        // the last required arg is a query, just concat all the following args that are not flags
        if (i === requiredArgs.length - 1 && requiredArg.type === "query") {
            let concat = "";

            for (let j = i; j < actualArgs.length; j++) {
                // check if the flags start
                if (actualArgs[j].startsWith("-")) {
                    break;
                }
                sliceIndex++;
                concat += actualArgs[j];
                concat += " ";
            }

            returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: concat});
            break;
        }

        if (requiredArg.type === "voiceChannel") {
            let channel;
            let filteredChannel = client.channels.cache.find(channel => channel.type === "voice" && channel.name.localeCompare(actualArg, "de", {sensitivity: "accent"}) === 0);

            console.log("filtered channel", filteredChannel);

            if (filteredChannel) {
                channel = filteredChannel;
            } else if (VOICE_CHANNEL_ID_REGEX.test(actualArg)) {
                // the user provided a channel
                // get the channel
                let channelId = actualArg.match(VOICE_CHANNEL_ID_REGEX)[1];
                let tempChannel = await client.channels.fetch(channelId);
                // check the whether the channel is a valid voice channel
                if (!tempChannel || tempChannel.type !== "voice") {
                    // the user provided channel is not a valid voice channel, try to take the voice channel the user is in, if possible
                    if (member.voice.channel) {
                        channel = member.voice.channel;
                    } else {
                        throw `You have to provide a valid voice channel or be in a voice channel`;
                    }
                } else {
                    channel = tempChannel;
                }
            } else if (member.voice.channel) {
                // the user didn't provide a channel, take the user's channel
                channel = member.voice.channel;
                actualArgs.splice(i, 0, "voiceChannel");
                actualArg = "voiceChannel";
            } else {
                throw `You have to provide a valid voice channel or be in a voice channel`;
            }

            returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: channel});
            continue;
        }

        //No more message args
        if (!actualArg) {
            if (requiredArg.optional) {
                return {returnObj: returnObj, slice: sliceIndex};
            } else {
                let missingArgs = requiredArgs.slice(i);

                throw `Missing arguments: ${missingArgs.map(arg => arg.name).toString()}`;
            }
        }

        let item = parser.getParsed(requiredArg, actualArg);

        if (requiredArg.permissionLevel && requiredArg.permissionLevel > userPermissionLevel) {
            throw `${requiredArg.name}: You don't have permission to use this argument`;
        }
        sliceIndex++;

        returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: item});
    }

    return {returnObj: returnObj, slice: sliceIndex};
}

// parses the flags
function parseFlags(command, args, returnObj) {
    if (!command.flags) {
        return
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg.startsWith("--")) {
            i = parseLongFlag(i, args, command, returnObj);
            continue;
        }

        console.log("before: " + i);
        if (arg.startsWith("-")) {
            i = parseShortFlag(i, args, command, returnObj);
        }
        console.log("after: " + i);
    }
}

// parses a flag like --example
function parseLongFlag(index, args, command, returnObj) {
    let arg = args[index];

    for (let flag of command.flags) {
        if (flag.long === arg) {
            let {value, add} = getValueForFlag(flag, args[index + 1]);

            index += add;

            Object.defineProperty(returnObj, flag.name, {value: value});
            return index;
        }
    }

    throw `${arg.substring(1, arg.length - 1)}: is not a valid flag`;
}

// parses a flag like -e
function parseShortFlag(index, args, command, returnObj) {
    let arg = args[index];
    let shortFlags = arg.split("");

    // remove the -
    shortFlags.shift();

    for (let shortFlag of shortFlags) {
        let valid = false;

        for (let flag of command.flags) {
            if (flag.short === "-" + shortFlag) {
                let {value, add} = getValueForFlag(flag, args[index + 1]);

                index += add;
                Object.defineProperty(returnObj, flag.name, {value: value});
                valid = true;
                break;
            }
        }

        if (!valid) {
            throw `${arg.substring(1, arg.length)}: is not a valid combination of flags`;
        }
    }

    return index;
}

// returns true if the flag does not need an arg or has a predefined value to return
function getValueForFlag(flag, nextArg) {
    if (flag.arg && !nextArg) {
        throw `${flag.name}: This flag needs a argument of type ${flag.arg.type}`;
    }

    let value;
    let add = 0;

    if (flag.arg) {
        value = parser.getParsed(flag.arg.type, nextArg);
        add = 1;
    } else {
        value = flag.value ? flag.value : true;
    }

    return {value: value, add: add};
}

// loads all commands in the commands folder
function loadCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    console.log(`Found ${commandFiles.length} commands`);

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        let newCommand = command;
        let prevSubCmd = newCommand;

        // check for subcommands in extra files and load them
        while (newCommand.subcommands) {
            for (let subCmd of newCommand.subcommands) {
                if (subCmd.file) {
                    let index = newCommand.subcommands.indexOf(subCmd);

                    newCommand.subcommands[index] = require(`./commands/${subCmd.file}`);

                    prevSubCmd = newCommand;
                    newCommand = newCommand.subcommands[index];
                    break;
                }

            }

            // no new sub command was found, stop searching
            if (prevSubCmd === newCommand) {
                break;
            }
        }

        commands.push(command);
    }
}

// merges queries to a single strings that are given in quotation marks like "this is a test query"
function mergeQuery(args) {
    let newArgs = [];

    let currentlyInQuery = false;
    let query = "";

    for (let arg of args) {
        if (arg.endsWith("\"") || arg.endsWith("'")) {
            currentlyInQuery = false;
            query += " ";
            query += arg.substring(0, arg.length - 1);
            newArgs.push(query);
        } else if (arg.startsWith("\"") || arg.startsWith("'")) {
            currentlyInQuery = true;
            query += arg.substring(1);
        } else if (currentlyInQuery) {
            query += " ";
            query += arg;
        } else {
            newArgs.push(arg);
        }
    }

    if (currentlyInQuery) {
        throw `missing a closing " or '`
    }

    return newArgs;
}

function modifyCommand(commandName, modifierFunction) {
    let command = getCommand(commandName);
    let index = commands.indexOf(command);
    commands[index] = modifierFunction(command);
}

module.exports.parseCommand = parseCommand;
module.exports.modifyCommand = modifyCommand;