const fs = require("fs");

function getCommandHelp(command) {
    return {
        embed: {
            color: 0x0000ff,
            title: `Help for ${command.name}`,
            description: `${command.description ? command.description : ""}\nSyntax: ${getCommandSyntax(command)}`,
            fields: getSubcommandList(command)
        }
    }
}

function getCommandSyntax(command) {
    let argList = [];

    if (command.args) {
        argList = command.args.map(arg => {
            return arg.optional ? `[${arg.name}]` : arg.name;
        });
    }

    return `${command.name} ${argList.join(" ")}`;
}

function getSubcommandList(command) {
    if (!command.subcommands) {
        return [];
    }

    return command.subcommands.map(cmd => {
        return {
            name: cmd.name,
            value: cmd.description ? cmd.description : "No description available"
        }
    });
}

function getHelp(commands, permissionLevel) {
    let filteredCommands = commands.filter(cmd => cmd.permissionLevel <= permissionLevel);
    return {
        embed: {
            color: 0x0000ff,
            title: `Currently available commands:`,
            description: filteredCommands.map(cmd => cmd.name).join(", ")
        }
    };
}

module.exports.getHelp = getHelp;
module.exports.getCommandHelp = getCommandHelp;