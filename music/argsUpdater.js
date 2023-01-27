musicplayer.on("queueChange", (queue) => {
    commandHandler.modifyCommand("music", (command) => {
        command.subcommands.find(subCmd => subCmd.name === "remove").args[0].max = queue.getSongAmount();
        command.subcommands.find(subCmd => subCmd.name === "jump").args[0].max = queue.getSongAmount();
        return command;
    });
});