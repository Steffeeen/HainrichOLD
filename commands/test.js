/*
    ALL COMMANDS IN THIS FILE ARE ONLY USED TO TEST STUFF
    there may be duplicate methods and other stuff
 */

module.exports = {
    name: "test",
    permissionLevel: 2,
    subcommands: [
        {
            name: "embed",
            run: (msg) => {
                msg.channel.send({
                    embed: {
                        color: 0x0099ff,

                        thumbnail: {
                            url: 'https://i.imgur.com/wSTFkRM.png',
                        },
                        fields: [
                            {
                                name: 'Inline field title',
                                value: "",
                                inline: true,
                            },
                            {
                                name: 'Inline field title',
                                value: 'Some value here',
                                inline: true,
                            },
                            {
                                name: 'Inline field title',
                                value: 'Some value here',
                                inline: true,
                            },
                        ]
                    }
                })
            }
        },
        {
            name: "uiCurrentSong",
            run: (msg) => {
                msg.channel.send({
                    embed: {
                        color: 0x0000ff,
                        thumbnail: {
                            url: 'https://i.imgur.com/wSTFkRM.png',
                        },
                        fields: [{
                            name: "Currently playing:",
                            value: "gsziudfzsgdfsdgiufsdsdsfjfghlkfgjhklfgjklhfghf",
                            inline: true
                        }, {
                            name: "\u200b",
                            value: "\u200b",
                            inline: true
                        }, {
                            name: "Progress",
                            value: "0:20/2:20",
                            inline: true
                        }, {
                            name: "\u200b",
                            value: "\u200b",
                            inline: true
                        }, {
                            name: "\u200b",
                            value: "\u200b",
                            inline: true
                        }, {
                            name: "Added by:",
                            value: "hhsjsdfsdf",
                            inline: true
                        }]
                    }
                })
            }
        },
        {
            name: "time",
            args: [
                {
                    name: "time",
                    type: "positiveNumber"
                }
            ],
            run: async (msg, args) => {
                msg.channel.send(getProgressDisplayString(args.time));
            }
        },
        {
            name: "coverArt",
            args: [
                {
                    name: "query",
                    type: "query"
                }
            ],
            run: async (msg, args) => {
                let image = await getCoverImageUrl(args.query);
                msg.channel.send(image);
            }
        }
    ]
}

async function getCoverImageUrl(query) {
    const genius = require("genius-lyrics");
    const Genius = new genius.Client(config.geniusToken);

    let songs = await Genius.tracks.search(query, {onlySongs: true, limit: 1});
    let song = songs[0];
    return song.thumbnail;
}

function getProgressDisplayString(progress) {
    let result = "";

    let hours = progress / 3600;
    if (hours >= 1) {
        result += addLeadingZero(Math.round(hours));
        result += ":";
    }

    let minutes = Math.floor(progress / 60) % 60
    result += addLeadingZero(minutes);
    result += ":";

    let seconds = progress % 60;
    result += addLeadingZero(seconds);

    return result;
}

function addLeadingZero(number) {
    if (`${number}`.length === 1) {
        return `0${number}`;
    }
    return number;
}