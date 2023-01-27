module.exports = {
    // mark this as a subcommand, so that it doesn't get loaded as a normal command
    type: "subcommand",
    name: "sub4",
    permissionLevel: 2,
    run: (msg) => {
        msg.channel.send("sub command sub4, loaded from external file");
    }
};