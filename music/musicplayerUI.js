const UIManager = require("../messageUI/uiManager");
const UIList = require("../messageUI/uiList");
const UICurrentSong = require("../messageUI/uiCurrentSong");
const UIStatus = require("../messageUI/uiStatus");
const util = require("../util/util");
const parser = require("../parser");

const PLAYING_COLOR = 7134506;
const PAUSED_COLOR = 14628655;

let textChannel;

let uiManager, queueUI, currentUI, statusUI;

let leaveChannelStatus;

client.on("disconnect", () => {
    uiManager.removeAll();
});

musicplayer
    .on("changeSong", (song, progress) => {
        currentUI.update({song, progress: progress + 1});
    })

    .on("play", () => {
        currentUI.update({color: PLAYING_COLOR});
    })

    .on("pause", () => {
        currentUI.update({color: PAUSED_COLOR});
    })

    .on("queueChange", (queue) => {
        updateQueueDisplay(queue);
        currentUI.update({queueAmount: queue.getSongAmount(), queueLength: queue.getTotalLength()});
    })

    .on("showLeaveChannelTimer", () => {
        uiManager.addComponent(leaveChannelStatus);
    })

    .on("hideLeaveChannelTimer", () => {
        uiManager.removeComponent(leaveChannelStatus);
    })

    .on("changeTextChannel", (channel) => {
        setTextChannel(channel);
    })

    .on("showSearchUI", (member, results) => {
        let listItems = results.map((result, index) => {
            return `${index + 1}) ${result.title} (${result.timestamp})`
        });

        let searchUI = new UIList(textChannel, listItems);
        uiManager.addComponent(searchUI);

        const filter = m => m.author.id === member.id;
        const collector = textChannel.createMessageCollector(filter, {time: 30000});

        collector.on("collect", async m => {
            let indices = await parser.getParsed({
                type: "list",
                min: 1,
                max: 20
            }, m.content);

            if (indices.length === 0) {
                return;
            }

            let songs = indices.map(index => {
                return {
                    query: results[index - 1].url,
                    member: member
                };
            });

            await musicplayer.addToQueue(songs);
            collector.stop();
        });

        collector.on("end", () => {
            uiManager.removeComponent(searchUI);
        });
    });

async function init() {
    if (config.textChannel) {
        textChannel = await client.channels.fetch(config.textChannel);
        setTextChannel(textChannel);
    }
}

function updateQueueDisplay(queue) {
    let listItems = queue.getQueue().map((song, index) => {
        return `${index + 1}) ${song.title} (${util.convertSecondsToTimeString(song.length)})`;
    });

    queueUI.setListItems(listItems);
}

async function setTextChannel(channel) {
    textChannel = channel;

    config.textChannel = textChannel.id;
    updateConfig(config);

    if (uiManager) {
        uiManager.removeAll();
    }

    uiManager = await setUpUIManager(textChannel);

    currentUI = new UICurrentSong(textChannel);

    //TODO change some reactions
    currentUI.on("🔀", () => toggleRandom());
    currentUI.on("⏮", () => back());
    currentUI.on("⏯", () => togglePause());
    currentUI.on("⏭", () => skip());
    currentUI.on("🔁", () => cycleLoop());

    queueUI = new UIList(textChannel, undefined, 10, "The queue is empty");

    leaveChannelStatus = new UIStatus(channel);
    leaveChannelStatus.setStatus("Leaving voice channel in 1 minute if no one joins");

    uiManager.addComponent(currentUI);
    uiManager.addComponent(queueUI);
}

function setUpUIManager(textChannel) {
    return new Promise((resolve, reject) => {
        let uiManager = new UIManager(textChannel);

        uiManager.on("ready", () => {
            resolve(uiManager);
        });
    });
}

module.exports.init = init;