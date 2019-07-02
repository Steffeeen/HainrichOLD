const channel = require("../channel.js");

exports.permissionLevel = 2;
exports.run = (client, msg, args) => {
    if(args.length === 0) {
        let userChannel = msg.member.voiceChannel;

        if(userChannel) {
            if(userChannel === client.) {
                channel.leave();
            } else {
                channel.join(userChannel);
            }
            channel.join(userChannel);
        } else if(channel.getCurrentChannel() !== null) {
            channel.leave();
        } else {
            msg.channel.send("You have to be in a channel!");
        }
    }
};