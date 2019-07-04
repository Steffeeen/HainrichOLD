const musicplayer = require("../music/musicplayer");

exports.permissionLevel = 2;
exports.description = "Just to test channel joining";
exports.args = "<join|leave>";
exports.minArgs = 1;
exports.maxArgs = 1;

exports.run = (client, msg, args) => {
     if(args[0] === "join") {
         if(msg.member.voiceChannel) {
             musicplayer.joinChannel(msg.member.voiceChannel);
         }
     } else if(args[0] === "leave") {
         musicplayer.leaveChannel();
     } else {
         musicplayer.play(args[0]);
     }
};
