module.exports = {
    name: "sub4",
    permissionLevel: 2,
    run: (msg) => {
        msg.channel.send("sub command sub4, loaded from external file");
    }
};