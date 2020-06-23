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
            run: async (msg, args) => {
                if (msg.member.voice.channel) {
                    console.log("Is in voice channel");
                    await musicplayer.joinChannel(msg.member.voice.channel);
                }

                if (!musicplayer.isStreamRunning()) {
                    console.log("begin in music");
                    musicplayer.begin();
                } else {
                    console.log("play in music");
                    musicplayer.play();
                }
            }
        }, {
            name: "pause",
            aliases: ["pa"],
            args: [],
            run: (msg, {}) => {
                musicplayer.pause();
            }
        }, {
            name: "togglePause",
            aliases: ["p"],
            args: [],
            run: (msg, {}) => {
                musicplayer.togglePause();
            }
        }, {
            name: "skip",
            aliases: ["s"],
            args: [],
            run(msg, {}) {
                musicplayer.skip();
            }
        }, {
            name: "back",
            aliases: ["ba"],
            args: [],
            run(msg, {}) {
                musicplayer.back();
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
                    musicplayer.changeVolume(args.volume);
                } else {
                    msg.channel.send(musicplayer.getVolume());
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
            run: (msg, args) => {
                musicplayer.addToQueue(args.query, msg.member);
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
                msg.channel.send(musicplayer.removeFromQueue(args.index - 1));
            }
        }, {
            name: "clear",
            aliases: ["c"],
            args: [],
            run(msg, args) {
                musicplayer.clearQueue();
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
                musicplayer.search(args.query, msg);
            }
        }, {
            name: "textChannel",
            permissionLevel: 2,
            aliases: [],
            args: [],
            run: (msg, args) => {
                musicplayer.setTextChannel(msg.channel);
                msg.channel.send("Set this channel as the new text channel");
            }
        }],
    run(client, msg, args) {

    }
};