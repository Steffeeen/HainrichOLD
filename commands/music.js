const mp = require("../music/musicplayer");

global.musicplayer = mp;

module.exports = {
    name: "music",
    description: "Everything for controlling music",
    aliases: ["m"],
    permissionLevel: 2,
    args: [],
    subcommands: [
        {
            name: "play",
            aliases: ["pl", "resume"],
            args: [],
            run: async (client, msg, args) => {
                if (msg.member.voice.channel) {
                    console.log("Is in voice channel");
                    await mp.joinChannel(msg.member.voice.channel);
                }

                if (!mp.isStreamRunning()) {
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
            args: [],
            run: (client, msg, {}) => {
                mp.pause();
            }
        }, {
            name: "togglePause",
            aliases: ["p"],
            args: [],
            run: (client, msg, {}) => {
                mp.togglePause();
            }
        }, {
            name: "skip",
            aliases: ["s"],
            args: [],
            run(client, msg, {}) {
                mp.skip();
            }
        }, {
            name: "back",
            aliases: ["ba"],
            args: [],
            run(client, msg, {}) {
                mp.back();
            }
        }, {
            name: "volume",
            aliases: ["v"],
            args: [
                {
                    name: "volume",
                    type: "positiveNumber",
                    min: 0,
                    max: 100,
                }
            ],
            run: (msg, args) => {
                if (args.volume) {
                    mp.changeVolume(args.volume);
                } else {
                    msg.channel.send(mp.getVolume());
                }
            }
        }, {
            name: "add",
            aliases: ["a"],
            args: [
                {
                    name: "query",
                    type: "query",
                }
            ],
            run: (client, msg, args) => {
                mp.addToQueue(args.query, msg.member);
            }
        }, {
            name: "remove",
            aliases: ["r"],
            args: [
                {
                    name: "index",
                    type: "positiveNumber",
                }
            ],
            run: (msg, args) => {
                msg.channel.send(mp.removeFromQueue(args.index - 1));
            }
        }, {
            name: "clear",
            aliases: ["c"],
            args: [],
            run(msg, args) {
                mp.clearQueue();
            }
        }, {
            name: "search",
            aliases: ["se"],
            args: [
                {
                    name: "query",
                    type: "query",
                }
            ],
            run(msg, args) {
                mp.search(args.query, msg);
            }
        }, {
            name: "textChannel",
            aliases: [],
            args: [],
            run: (msg, args) => {
                mp.setTextChannel(msg.channel);
                msg.channel.send("Set this channel as the new text channel");
            }
        }],
    run(client, msg, args) {

    }
};