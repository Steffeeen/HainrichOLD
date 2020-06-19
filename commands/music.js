const mp = require("../music/musicplayer");

global.musicplayer = mp;

module.exports = {
    name: "music",
    description: "Everything for controlling music",
    aliases: ["m"],
    permissionLevel: 2,
    args: [],
    subcommands: [{
        name: "play",
        aliases: ["pl", "resume"],
        permissionLevel: 2,
        args: [],
        async run(client, msg, args) {
            if (msg.member.voice.channel) {
                console.log("Is in voice channel");
                await mp.joinChannel(msg.member.voice.channel);
            }

            if(!mp.isStreamRunning()) {
                console.log("begin in music");
                mp.begin();
            } else {
                console.log("play in music");
                mp.play();
            }
        }
    }, {
        name: "pause",
        aliases: ["pa"],
        permissionLevel: 2,
        args: [],
        run(client, msg, {}) {
            mp.pause();
        }
    }, {
        name: "togglePause",
        aliases: ["p"],
        permissionLevel: 2,
        args: [],
        run(client, msg, {}) {
            mp.togglePause();
        }
    }, {
        name: "skip",
        aliases: ["s"],
        permissionLevel: 2,
        args: [],
        run(client, msg, {}) {
            mp.skip();
        }
    }, {
        name: "back",
        aliases: ["ba"],
        permissionLevel: 2,
        args: [],
        run(client, msg, {}) {
            mp.back();
        }
    }, {
        name: "volume",
        aliases: ["v"],
        permissionLevel: 2,
        args: [{
            name: "volume",
            permissionLevel: 2,
            type: "int",
            optional: true,
            validate: arg => {return arg <= 100 && arg >= 0}
        }],
        run(client, msg, {volume}) {
            if(volume) {
                mp.changeVolume(volume);
            } else {
                msg.channel.send(mp.getVolume());
            }
        }
    }, {
        name: "add",
        aliases: ["a"],
        permissionLevel: 2,
        args: [{
            name: "query",
            permissionLevel: 2,
            type: "searchquery",
            optional: false,
            validate: () => {
                return true;
            }
        }],
        run(client, msg, {query}) {
            mp.addToQueue(query, msg.member);
        }
    }, {
        name: "remove",
        aliases: ["r"],
        permissionLevel: 2,
        args: [{
            name: "index",
            permissionLevel: 2,
            type: "int",
            optional: false,
            validate: arg => {return true;}
        }],
        run(client, msg, {index}) {
            msg.channel.send(mp.removeFromQueue(index - 1));
        }
    }, {
        name: "clear",
        aliases : ["c"],
        permissionLevel: 2,
        args: [],
        run(client, msg, {}) {
            mp.clearQueue();
        }
    }, {
        name: "search",
        aliases: ["se"],
        permissionLevel: 2,
        args: [{
            name: "query",
            permissionLevel: 2,
            type: "searchquery",
            optional: false,
            validate: arg => {return true;}
        }],
        run(client, msg, {query}) {
            mp.search(query, msg);
        }
    }, {
        name: "textChannel",
        aliases: [],
        permissionLevel: 2,
        args: [],
        run(client, msg, {}) {
            mp.setTextChannel(msg.channel);
            msg.channel.send("Set this channel as the new text channel");
        }
    }],
    run(client, msg, {}) {

    },
    noArgs(client, msg) {

    }
};