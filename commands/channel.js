exports.permissionLevel = 1;
exports.voiceChannel = undefined;
exports.connection = undefined;
exports.run = (client, msg, args) => {

     if(args.length === 1) {
          if(args[0] === "join") {
               if(msg.member.voiceChannel) {
                    this.voiceChannel = msg.member.voiceChannel;
                    msg.member.voiceChannel.join().then(connection => {
                         this.connection = connection;
                         msg.channel.send("Connected to your channel");
                    });
               } else {
                    msg.channel.send("You have to be in a channel");
               }
          } else
          if(args[0] === "leave") {
               this.voiceChannel.leave();
               msg.channel.send("Left your channel");
          }
     } else {
          msg.channel.send("Usage: channel <join|leave>");
     }
};
