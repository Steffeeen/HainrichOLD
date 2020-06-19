const parser = require("./parser");
const fs = require("fs");

let commands = [];

loadCommands();

//takes the message, parses it and executes the command
function parseCommand(msg) {
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

    console.log(`command is ${command.name} after sub command check, args are: ${args.toString()}`);

    /*// no args needed
    if(!needsArgs) {
        if(command.run) {
            command.run(msg);
            return;
        } else {
            msg.channel.send("The command can't be run without arguments or sub commands")
        }
    }*/

    let argsObject;

    try {
        argsObject = checkArgs(command.args, args, userPermissionLevel);
    } catch (e) {
        msg.channel.send(e.toString());
        return;
    }

    let sliceIndex = command.args ? command.args.length : 0;

    try {
        parseFlags(command, args.slice(sliceIndex), argsObject);
    } catch (e) {
        msg.channel.send(e.toString());
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
        if (cmd.aliases.includes(commandName)) {
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

//Compares the provided args with the required args
function checkArgs(requiredArgs, actualArgs, userPermissionLevel) {
    let returnObj = {};

    if (!requiredArgs) {
        return returnObj;
    }

    for (let i = 0; i < requiredArgs.length; i++) {
        let requiredArg = requiredArgs[i];
        let actualArg = actualArgs[i];

        //No more message args, but more a required
        if (!actualArg) {
            let missingArgs = requiredArgs.slice(i);

            throw `Missing arguments: ${missingArgs.map(arg => arg.name).toString()}`;
        }

        let min, max;

        if (requiredArg.min) {
            min = requiredArg.min;
        }

        if (requiredArg.max) {
            max = requiredArg.max;
        }

        let item = parser.getParsed(requiredArg.type, actualArg, min, max);

        if (requiredArg.permissionLevel && requiredArg.permissionLevel > userPermissionLevel) {
            throw `${requiredArg.name}: You don't have permission to use this argument`;
        }

        returnObj = Object.defineProperty(returnObj, requiredArg.name, {value: item});
    }

    return returnObj;
}

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

function getValueForFlag(flag, nextArg) {
    if (!nextArg) {
        throw `This flag needs a argument of type ${flag.arg.type}`;
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

function loadCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    console.log(`Found ${commandFiles.length} commands`);

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        let newCommand = command;
        let prevSubCmd = newCommand;

        while (newCommand.subcommands) {
            console.log(`new command is: ${newCommand.name}`);
            for (let subCmd of newCommand.subcommands) {
                console.log(`current command: ${command.name}`);
                console.log(`current sub command: ${subCmd.name}`);
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

module.exports.parseCommand = parseCommand;