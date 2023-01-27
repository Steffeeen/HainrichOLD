const util = require("../util/util");

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
            args: [
                {
                    name: "channel",
                    type: "voiceChannel"
                }
            ],
            run: (msg, args) => {
                musicplayer.play(args.channel);
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
            name: "jump",
            aliases: ["j", "goTo", "goto"],
            args: [
                {
                    name: "index",
                    type: "positiveInteger",
                    min: 1,
                    max: 1
                }
            ],
            run: (msg, args) => {
                musicplayer.goToSong(args.index - 1);
            }
        }, {
            name: "loop",
            aliases: ["lo", "l"],
            args: [
                {
                    name: "loop",
                    type: "value",
                    values: ["none", "queue", "song"],
                    optional: true
                }
            ],
            run: (msg, args) => {
                if (args.loop) {
                    musicplayer.setLoop(args.loop);
                    msg.channel.send(`Changing loop mode to ${args.loop}`);
                } else {
                    // TODO create central method for converting loop mode to string
                    let loopMode = ["none", "queue", "song"];
                    let result = musicplayer.cycleLoop();
                    msg.channel.send(`Changing loop mode to ${loopMode[result]}`);
                }
            }
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
                    type: "positiveInteger",
                    optional: true,
                    min: 0,
                    max: 100,
                }
            ],
            run: (msg, args) => {
                if (args.volume) {
                    musicplayer.changeVolume(args.volume);
                } else {
                    msg.channel.send(`Current Volume: ${musicplayer.getVolume()}`);
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
                    name: "items",
                    type: "queueItems"
                }
            ],
            flags: [
                {
                    name: "multiple",
                    short: "-m",
                    long: "--multiple",
                    description: "whether to remove multiple, only used when inputting a regex"
                }
            ],
            run: (msg, args) => {
                let {type, indices} = args.items;
                if (type === "regex" && !args.multiple) {
                    musicplayer.removeFromQueue(indices.shift());
                } else {
                    musicplayer.removeFromQueue(...indices);
                }
            }
        }, {
            name: "move",
            aliases: ["m", "mo", "mov"],
            args: [
                {
                    name: "items",
                    type: "queueItems"
                }, {
                    name: "to",
                    type: "queueItems"
                }
            ],
            flags: [
                {
                    name: "multiple",
                    short: "-m",
                    long: "--multiple",
                    description: "whether to remove multiple, only used when inputting a regex"
                }
            ],
            run: (msg, args) => {
                console.log("move");
                let itemType = args.items.type;
                let itemIndices = args.items.indices;
                let toIndices = args.to.indices;
                let to = toIndices.shift();

                if (itemType === "regex" && !args.multiple) {
                    musicplayer.moveSongs(to, itemIndices.shift());
                } else {
                    musicplayer.moveSongs(to, ...itemIndices);
                }
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
            name: "info",
            aliases: ["i"],
            args: [
                {
                    name: "item",
                    type: "queueItems"
                }
            ],
            run(msg, args) {
                let index = args.item.indices[0];
                let info = musicplayer.getSongInfo(index);
                let embed = {
                    color: 0x65E382,
                    title: `${index + 1}) ${info.title}`,
                    url: info.url,
                    thumbnail: {
                        url: info.imageUrl
                    },
                    fields: [
                        {
                            name: "Length",
                            value: util.convertSecondsToTimeString(info.length),
                            inline: true
                        }, {
                            name: "Added By",
                            value: info.member.username,
                            inline: true
                        }
                    ]
                };
                msg.channel.send({embed: embed});
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