const fs = require("fs");

exports.getHelpMessage = (command) => {
    try {
        let commandFile = require("./commands/" + command + ".js");
        return `${command}: /${command} ${commandFile.args} \n${commandFile.description}`;
    } catch(err) {
        return "Command not found!";
    }
};

exports.getHelp = () => {
    let message = "--------------Help--------------";

    let files = fs.readdirSync("./commands/");
    for(let file of files) {
        let commandFile = require("./commands/" + file);
        let command = file.slice(0, -3);
        message = message.concat("\n---------------------------------- \n", `${command}: /${command} ${commandFile.args} \n${commandFile.description}`);
    }
    return message;
};