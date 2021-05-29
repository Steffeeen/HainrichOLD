const parser = require("./parser");
const fs = require("fs");
const helper = require("./helper");
const {UserError} = require("./error");

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

    try {
        let command = getCommand(commandName);

        let userPermissionLevel = checkPermissionLevel(msg, command);

        let subCmdResult = getSubCommand(command, messageArgs, userPermissionLevel);

        command = subCmdResult.command;
        let args = mergeQuery(subCmdResult.args);

        logger.info(`command is ${command.name} after sub command check, args are: ${args.toString()}`);

        let {returnObj, slice} = await checkArgs(command.args, args, userPermissionLevel, msg.member);
        let argsObject = returnObj;

        await parseFlags(command, args.slice(slice), argsObject);

        command.run(msg, argsObject, {permissionLevel: userPermissionLevel});
    } catch (error) {
        if (error instanceof UserError) {
            msg.channel.send(error.message);
        }
    }
}

// gets the base command
function getCommand(commandName) {
    let command = commands.find(cmd => cmd.name === commandName);

    if (command) {
        return command;
    }

    //check for aliases
    for (let cmd of commands) {
        if (cmd.aliases && cmd.aliases.includes(commandName)) {
            return cmd;
        }
    }

    throw new UserError("Command not found");
}

// get the permission level for the command sender
function checkPermissionLevel(msg, command) {
    let userPermissionLevel = 0;

    if (msg.author.id === config.ownerID) userPermissionLevel = 100000;

    if (config.modIDs.includes(msg.author.id)) {
        userPermissionLevel = 1;
    }

    if (command.permissionLevel > userPermissionLevel) {
        throw new UserError("You don't have permission to use this command");
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
                    throw new UserError("You don't have permission to use this sub command");
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

        // the last required arg is a query or queueItems, just concat all the following args that are not flags
        if (i === requiredArgs.length - 1 && (requiredArg.type === "query" || requiredArg.type === "queueItems")) {
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

            actualArgs[i] = concat;
            actualArg = concat;
        }

        if (requiredArg.type === "voiceChannel") {
            let channel;
            let filteredChannel = client.channels.cache.find(channel => channel.type === "voice" && channel.name.localeCompare(actualArg, "de", {sensitivity: "accent"}) === 0);

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
                        throw new UserError(`You have to provide a valid voice channel or be in a voice channel`);
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
                throw new UserError(`You have to provide a valid voice channel or be in a voice channel`);
            }

            returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: channel});
            continue;
        }

        //No more message args
        if (!actualArg) {
            if (requiredArg.optional) {
                // the required arg is optional
                return {returnObj: returnObj, slice: sliceIndex};
            } else {
                // the arg is required, send an error message to the user
                let missingArgs = requiredArgs.slice(i).filter(arg => !arg.optional);
                throw new UserError(`Missing arguments: ${missingArgs.map(arg => arg.name).toString()}`);
            }
        }

        // union args
        if (requiredArg.type === "union") {
            let item;
            let type;
            for (let allowedArg of requiredArg.allowedArgs) {
                try {
                    item = await parser.getParsed(allowedArg, actualArg);
                } catch (e) {
                    // we got an error parsing, the actualArg is not valid for this type, move on to next
                    continue;
                }
                // successfully parsed arg, break
                type = allowedArg.type;
                break;
            }
            if (!item) {
                // item is undefined, the actualArg didn't match any of the union types
                throw new UserError(`${actualArg}: the provided argument doesn't match any of the following allowed types: ${requiredArg.allowedArgs.map(arg => arg.type)}`);
            }

            // we found an arg
            sliceIndex++;
            returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: {type, value: item}});
            continue;
        }

        let item = await parser.getParsed(requiredArg, actualArg);

        if (requiredArg.permissionLevel && requiredArg.permissionLevel > userPermissionLevel) {
            throw new UserError(`${requiredArg.name}: You don't have permission to use this argument`);
        }
        if (requiredArg.type !== "query" && requiredArg.type !== "queueItems") {
            sliceIndex++;
        }

        returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: item});
    }

    return {returnObj: returnObj, slice: sliceIndex};
}

// parses the flags
async function parseFlags(command, args, returnObj) {
    if (!command.flags) {
        return
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg.startsWith("--")) {
            i = await parseLongFlag(i, args, command, returnObj);
            continue;
        }

        if (arg.startsWith("-")) {
            i = await parseShortFlag(i, args, command, returnObj);
        }
    }
}

// parses a flag like --example
async function parseLongFlag(index, args, command, returnObj) {
    let arg = args[index];

    for (let flag of command.flags) {
        if (flag.long === arg) {
            let {value, add} = await getValueForFlag(flag, args[index + 1]);

            index += add;

            Object.defineProperty(returnObj, flag.name, {value: value});
            return index;
        }
    }

    throw new UserError(`${arg.substring(1, arg.length - 1)}: is not a valid flag`);
}

// parses a flag like -e
async function parseShortFlag(index, args, command, returnObj) {
    let arg = args[index];
    let shortFlags = arg.split("");

    // remove the -
    shortFlags.shift();

    for (let shortFlag of shortFlags) {
        let valid = false;

        for (let flag of command.flags) {
            if (flag.short === "-" + shortFlag) {
                let {value, add} = await getValueForFlag(flag, args[index + 1]);

                index += add;
                Object.defineProperty(returnObj, flag.name, {value: value});
                valid = true;
                break;
            }
        }

        if (!valid) {
            throw new UserError(`${arg.substring(1, arg.length)}: is not a valid combination of flags`);
        }
    }

    return index;
}

// returns true if the flag does not need an arg or has a predefined value to return
async function getValueForFlag(flag, nextArg) {
    if (flag.arg && !nextArg) {
        throw new UserError(`${flag.name}: This flag needs a argument of type ${flag.arg.type}`);
    }

    let value;
    let add = 0;

    if (flag.arg) {
        value = await parser.getParsed(flag.arg.type, nextArg);
        add = 1;
    } else {
        value = flag.value ? flag.value : true;
    }

    return {value: value, add: add};
}

// loads all commands in the commands folder
function loadCommands() {
    loadCommandsInDir("./commands");

    logger.info(`Loaded ${commands.length} commands`);
}

function loadCommandsInDir(path) {
    const files = fs.readdirSync(path);

    for (const file of files) {
        if (fs.lstatSync(`${path}/${file}`).isDirectory()) {
            loadCommandsInDir(`${path}/${file}`);
            continue;
        }

        if (!file.endsWith(".js")) {
            continue;
        }

        const command = require(`${path}/${file}`);

        if (command.type && command.type === "subcommand") {
            continue;
        }

        let newCommand = command;
        let prevSubCmd = newCommand;

        // check for subcommands in extra files and load them
        while (newCommand.subcommands) {
            for (let subCmd of newCommand.subcommands) {
                if (subCmd.file) {
                    let index = newCommand.subcommands.indexOf(subCmd);

                    newCommand.subcommands[index] = require(`${path}/${subCmd.file}`);

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
        throw new UserError(`missing a closing " or '`);
    }

    return newArgs;
}

function modifyCommand(commandName, modifierFunction) {
    let command = getCommand(commandName);
    let index = commands.indexOf(command);
    commands[index] = modifierFunction(command);
}

function getHelp(permissionLevel) {
    if (!permissionLevel) {
        permissionLevel = 0;
    }
    return helper.getHelp(commands, permissionLevel);
}

function getCommandHelp(commandName, permissionLevel) {
    let command = getCommand(commandName);
    if (!command) {
        return `Could not find a command with the name ${commandName}`;
    }

    if (permissionLevel < command.permissionLevel) {
        return `You don't have permission to view this command`;
    }

    return helper.getCommandHelp(command);
}

module.exports.parseCommand = parseCommand;
module.exports.modifyCommand = modifyCommand;
module.exports.getHelp = getHelp;
module.exports.getCommandHelp = getCommandHelp;