module.exports = {
    name: "music",
    description: "Everything for controlling music",
    aliases: ["m"],
    permissionLevel: 2,
    args: [],
    subcommands: [
        /*
        playback control
         */
        {
            name: "play",
            aliases: ["pl", "resume"],
            args: [],
            run: async (msg) => {
                musicplayer.play(msg.member.voice.channel);
            }
        }, {
            name: "pause",
            aliases: ["pa"],
            args: [],
            run: (msg) => {
                musicplayer.pause();
            }
        }, {
            name: "togglePause",
            aliases: ["p"],
            args: [],
            run: (msg) => {
                musicplayer.togglePause();
            }
        }, {
            name: "skip",
            aliases: ["s"],
            args: [],
            run(msg) {
                musicplayer.skip();
            }
        }, {
            name: "back",
            aliases: ["ba", "previous", "prev"],
            args: [],
            run: (msg) => {
                musicplayer.back();
            }
        }, {
            name: "jump"
        }, {
            name: "loop"
        }, {
            name: "random"
        }, {
            name: "fastForward"
        }, {
            name: "rewind"
        }, {
            name: "seek"
        }, {
            name: "volume",
            aliases: ["v", "vol"],
            args: [
                {
                    name: "volume",
                    type: "positiveNumber",
                    optional: true,
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
        },
        /*
        queue control
         */
        {
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
                    name: "indices",
                    type: "list",
                    min: 1,
                    max: 1
                }
            ],
            run: (msg, args) => {
                let indices = args.indices.map(index => index - 1);
                musicplayer.removeFromQueue(...indices);
            }
        }, {
            name: "move"
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
        },
        /*
        channel control
         */
        {
            name: "join",
            permissionLevel: 2,
            args: [
                {
                    name: "channel",
                    type: "voiceChannel"
                }
            ],
            run: (msg, args) => {
                console.log(args.channel);
                musicplayer.joinChannel(args.channel).catch(() => {
                });

                /*if (msg.member.voice.channel) {
                    musicplayer.joinChannel(msg.member.voice.channel);
                } else {
                    msg.channel.send("you must be in a channel to use this command");
                }*/
            }
        }, {
            name: "leave",
            permissionLevel: 2,
            run: (msg) => {
                musicplayer.leaveChannel();
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