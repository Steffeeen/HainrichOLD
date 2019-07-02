exports.permissionLevel = 1;
exports.run = (client, msg, args) => {
     if(!args || args.length < 1) {
          return msg.channel.send("Usage: mod <list|add|remove> [name]");
     }

     const fs = require("fs");
     const config = require("../config.json");

     if(args.length === 1) {
          if(args[0] === "list") {
               let modNames = [];
               for(let i = 0; i < config.modIDs.length; i++) {
                    modNames[i] = client.users.get(config.modIDs[i]).toString();
               }
               msg.channel.send("Mods: " + modNames.toString());
          } else {
               return msg.channel.send("Usage: mod <list|add|remove> [name]");
          }
     }
     if(args.length === 2) {
          let userID = 0;
          if(msg.mentions.members.first !== undefined) {
               userID = msg.mentions.members.first().id;
          }
          if(args[0] === "add") {
               for(let i = 0; i < config.modIDs.length; i++) {
                    if(config.modIDs[i] === userID) {
                         msg.channel.send("User is already a mod");
                         return;
                    }
               }
               config.modIDs[config.modIDs.length] = userID;
               msg.channel.send("User " + args[1] + " is now a mod");
               fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));
          }
          if(args[0] === "remove") {
               console.log(config.modIDs.length);
               for(let i = 0; i < config.modIDs.length; i++) {
                    if(config.modIDs[i] === userID) {
                         config.modIDs.splice(i, 1);
                         msg.channel.send("User " + args[1] + " is no longer a mod");
                         fs.writeFile("./config.json", JSON.stringify(config), err => console.error(err));
                         return;
                    }
               }
               msg.channel.send("User not found");
          }
     }

}
