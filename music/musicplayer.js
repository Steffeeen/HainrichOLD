const ytdl = require("ytdl-core");
const queue = require("./queue.js");
const ytSearchCallback = require("yt-search");
const util = require("util");
const events = require("events");
const UIList = require("../messageUI/uiList");
const UICurrentSong = require("../messageUI/uiCurrentSong");
const UIStatus = require("../messageUI/uiStatus");
const fs = require("fs");

const eventEmitter = new events.EventEmitter();

const ytSearch = util.promisify(ytSearchCallback);

let textChannel;

load();

client.on("disconnect", () => {
    queueUI.deleteMessage();
    currentUI.deleteMessage();
});


let queueUI, currentUI, statusUI;

let voiceChannel;
let dispatcher;

let streamRunning = false;

let currentStream;

let volume = 0.05;

let paused = false;

async function load() {
    if (config.textChannel) {
        // textChannel = client.channels.find(e => e.id === config.textChannel);
        textChannel = await client.channels.fetch(config.textChannel);
        setTextChannel(textChannel);
        //client.channels.array().forEach(channel => console.log(channel.name));
    }
}

function begin() {
    nextSong();
    console.log("begin");
}

function nextSong() {
    stopStream();

    let nextSong = queue.getNextSongToPlay();

    if(nextSong) {
        console.log(nextSong);
        startStream(nextSong.url);
        updateCurrentDisplay();
        eventEmitter.emit("changesong", queue.getCurrentSong());
    }
}

function goToSong(index) {
    stopStream();

    startStream(queue.goToSong(index).url);
    updateCurrentDisplay();
    eventEmitter.emit("changesong", queue.getCurrentSong());
}

function skip() {
    if(queue.hasNext()) {
        stopStream();

        startStream(queue.goToNextSong().url);
        updateCurrentDisplay();
        eventEmitter.emit("changesong", queue.getCurrentSong());
    }
}

function back() {
    if(queue.hasPrevious()) {
        stopStream();

        startStream(queue.goToPrevSong().url);
        updateCurrentDisplay();
        eventEmitter.emit("changesong", queue.getCurrentSong());
    }
}

function startStream(url) {
    console.log(voiceChannel);
    if (voiceChannel) {
        console.log("voiceChannel");
        console.log("url: " + url);
        //TODO wait 1 sec
        dispatcher = voiceChannel.connection.play(ytdl(url, {filter: "audioonly"}), {
            volume: volume,
            passes: config.passes,
            seek: queue.getCurrentSong().start
        });
        streamRunning = true;
        console.log("started playing");
        updateCurrentDisplay();
        dispatcher.on("finish", reason => {
            console.log("stream ended: " + reason);
            if (reason !== "user") {
                nextSong();
            }
        });
    }
}

function stopStream() {
    if (voiceChannel) {
        if (dispatcher) {
            dispatcher.end();
            dispatcher = null;
            streamRunning = false;
        }
    }
}

function isStreamRunning() {
    return streamRunning;
}

function togglePause() {
    paused = !paused;
    if (paused) {
        pause();
    } else {
        play();
    }
}

function play() {
    if (dispatcher) {
        paused = false;
        dispatcher.resume();
        currentUI.setColor(7134506);
    }
}

function pause() {
    if (dispatcher) {
        paused = true;
        dispatcher.pause();
        currentUI.setColor(14628655);
    }
}

function toggleRandom() {
    queue.toggleRandom();
}

function cycleLoop() {
    queue.cycleLoop();
}

//TODO
function fadeVolume(volume) {

}

//0 - 100 50 is normal
function changeVolume(v) {
    volume = v / 1000;
    dispatcher.setVolume(volume);
}

function getVolume() {
    return volume * 1000;
}

async function addToQueue(query, member) {
    await queue.addSong(query, member);
    updateQueueDisplay();
}

function removeFromQueue(index) {
    if(queue.hasSong(index)) {
        queue.removeSongByIndex(index);
        updateQueueDisplay();
        return "Removed song from queue";
    } else {
        return "Song not found in queue"
    }
}

function clearQueue() {
    stopStream();
    queue.clear();
    updateQueueDisplay();
    updateCurrentDisplay();
}

function updateQueueDisplay() {
    let listItems = [];

    if(queue.getQueue().length === 0) {
        listItems.push("The queue is empty");
    }

    for(let i = 0; i < queue.getQueue().length; i++) {
        let item = queue.getSong(i);
        console.log("updateQueueDisplay: " + i);

        listItems.push(`${i + 1}) ${item.title} (${Math.floor(item.length / 60)}:${item.length % 60})`);
    }

    queueUI.setListItems(listItems);
}

function updateCurrentDisplay() {
    currentUI.setCurrentSong(queue.getCurrentSong());
    console.log("update current display");
}

function printQueue() {
    console.log(queue.getQueue());
}

async function joinChannel(channel) {
    let connection = await channel.join();
    console.log(connection.channel === undefined);
    voiceChannel = connection.channel;
    console.log(voiceChannel === undefined);
    eventEmitter.emit("join");
}

function leaveChannel() {
    if (voiceChannel) {
        voiceChannel.leave();
        voiceChannel = undefined;
        eventEmitter.emit("leave");
    }
}

async function search(query, msg) {
    let results = await ytSearch(query);

    let listItems = [];

    results = results.videos.slice(0, 20);

    for(let i = 0; i < results.length; i++) {
        listItems.push(`${i + 1}) ${results[i].title} (${results[i].timestamp})`);
    }

    let searchUI = new UIList(textChannel, listItems);

    const filter = m => m.author.id === msg.author.id;
    const collector = textChannel.createMessageCollector(filter, {time: 30000});

    collector.on("collect", async m => {
        if(m.content.includes("-")) {
            let range = m.content.split("-");
            console.log(range);
            if(range.length === 2) {
                let min = Math.min(parseInt(range[0]), parseInt(range[1]));
                let max = Math.max(parseInt(range[0]), parseInt(range[1]));

                if(min && max) {
                    m.react("🆗");
                    for(let i = min - 1; i < max; i++) {
                        console.log("i: " + i);
                        await addToQueue("https://www.youtube.com" + results[i].url);
                    }
                }
            }
        } else if(m.content.includes(",")) {
            let list = m.content.split(",");
            if(list.length > 0) {

                let indexes = [];

                for(let item of list) {
                    let parse = parseInt(item);
                    if(!isNaN(parse)) {
                        indexes.push(parse);
                    }
                }

                m.react("🆗");

                console.log(indexes);

                for(let index of indexes) {
                    await addToQueue("https://www.youtube.com" + results[index - 1].url);
                }
            }
        } else {
            let index = parseInt(m.content);

            if(index) {
                if(index >= 0 && index < results.length) {
                    addToQueue("https://www.youtube.com" + results[index - 1].url);
                    m.react("🆗");
                }
            }
        }
    });

    collector.on("end", collected => searchUI.deleteMessage());
}

function getProgress() {
    if(dispatcher) {
        return dispatcher.time;
    } else {
        return -1;
    }
}

async function setTextChannel(channel) {
    textChannel = channel;

    let messages = await textChannel.messages.fetch({limit: 100}, true);

    // while(messages.size > 0) {
    console.log(`Found ${messages.size} messages`);

    let amount = messages.size / 50;
    for (let i = 0; i < amount + 1; i++) {
        console.log(i);
        await textChannel.bulkDelete(50).catch(err => {
        });
    }

    messages = await textChannel.messages.fetch({limit: 100}, true);
    // }

    config.textChannel = textChannel.id;
    fs.writeFileSync("config.json", JSON.stringify(config));

    if (queueUI) {
        queueUI.deleteMessage();
    }

    if (currentUI) {
        currentUI.deleteMessage();
    }

    currentUI = new UICurrentSong(textChannel);

    //TODO change some reactions
    currentUI.on("🔀", () => toggleRandom());
    currentUI.on("⏮", () => back());
    currentUI.on("⏯", () => togglePause());
    currentUI.on("⏭", () => skip());
    currentUI.on("🔁", () => cycleLoop());

    queueUI = new UIList(textChannel, ["The queue is empty"]);

    //statusUI = new UIStatus(textChannel);
}

module.exports.events = eventEmitter;

module.exports.joinChannel = joinChannel;
module.exports.leaveChannel = leaveChannel;
module.exports.addToQueue = addToQueue;
module.exports.removeFromQueue = removeFromQueue;
module.exports.clearQueue = clearQueue;
module.exports.changeVolume = changeVolume;
module.exports.getVolume = getVolume;
module.exports.back = back;
module.exports.skip = skip;
module.exports.goToSong = goToSong;
module.exports.play = play;
module.exports.pause = pause;
module.exports.getPrograss = getProgress;
module.exports.togglePause = togglePause;
module.exports.isStreamRunning = isStreamRunning;
module.exports.begin = begin;
module.exports.search = search;

module.exports.updateQueueDisplay = updateQueueDisplay;
module.exports.updateCurrentDisplay = updateCurrentDisplay;

module.exports.startStream = startStream;
module.exports.stopStream = stopStream;
module.exports.printQueue = printQueue;
module.exports.nextSong = nextSong;
module.exports.queue = queue;
module.exports.setTextChannel = setTextChannel;