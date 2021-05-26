const ytdl = require("ytdl-core");
const queue = require("./queue.js");
const ytSearchCallback = require("yt-search");
const songLoader = require("./songLoader");
const nodeUtil = require("util");
const events = require("events");

const eventEmitter = new events.EventEmitter();

const ytSearch = util.promisify(ytSearchCallback);

let textChannel;

let voiceChannel;
let voiceConnection;
let dispatcher;

let streamRunning = false;

const volumeMultiplier = 500;
let volume = 0.1;

let leaveChannelTimer;

// used to check whether the stream ended because of user interaction
// used to automatically play the next song in the queue
let wasUser = false;

async function start(channel) {
    if (queue.isEmpty()) return;
    if (streamRunning) return;

    if (!isInVoiceChannel()) {
        await joinChannel(channel);
    }

    let song = queue.getNextSongToPlay();

    if (song) {
        startStream(song);
        eventEmitter.emit("changeSong", queue.getCurrentSong(), queue.getProgress());
    }
}

async function play(channel) {
    if (isInVoiceChannel() && isPaused()) {
        resume();
        return;
    }

    start(channel);
}

function pause() {
    if (dispatcher) {
        dispatcher.pause();
        eventEmitter.emit("pause");
    }
}

function resume() {
    if (dispatcher) {
        dispatcher.resume();
        eventEmitter.emit("play");
    }
}

function togglePause() {
    if (!dispatcher.paused) {
        pause();
    } else {
        resume();
    }
}

function toggleRandom() {
    queue.toggleRandom();
}

function cycleLoop() {
    return queue.cycleLoop();
}

function setLoop(loop) {
    queue.setLoop(loop);
}

function nextSong() {
    stopStream();

    let nextSong = queue.getNextSongToPlay();

    if (nextSong) {
        startStream(nextSong);
        eventEmitter.emit("changeSong", queue.getCurrentSong(), queue.getProgress());
    } else {
        logger.log("debug", `next song is undefined`);
    }
}

function goToSong(index) {
    wasUser = true;
    stopStream();

    startStream(queue.goToSong(index));
    eventEmitter.emit("changeSong", queue.getCurrentSong(), queue.getProgress());
}

function skip() {
    if(queue.hasNext()) {
        wasUser = true;
        stopStream();

        startStream(queue.goToNextSong());
        eventEmitter.emit("changeSong", queue.getCurrentSong(), queue.getProgress());
    }
}

function back() {
    if (queue.hasPrevious()) {
        wasUser = true;
        stopStream();

        startStream(queue.goToPrevSong());
        eventEmitter.emit("changeSong", queue.getCurrentSong(), queue.getProgress());
    }
}

function isPaused() {
    if (dispatcher) return dispatcher.paused;
    return false;
}

async function startStream(song) {
    if (voiceConnection) {
        let file = await songLoader.getFile(song);
        dispatcher = voiceConnection.play(file, {
            volume: volume,
            passes: config.passes,
            seek: queue.getCurrentSong().start
        });
        streamRunning = true;

        dispatcher.on("finish", reason => {
            if (!wasUser) {
                nextSong();
                wasUser = false;
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
            eventEmitter.emit("changeSong", undefined, -1);
        }
    }
}

function isStreamRunning() {
    return streamRunning;
}

//TODO
function fadeVolume(volume) {

}

//0 - 100 50 is normal
function changeVolume(v) {
    if (v < 0 || v > 100) {
        return;
    }
    volume = v / volumeMultiplier;
    dispatcher.setVolume(volume);
}

function getVolume() {
    return volume * volumeMultiplier;
}

async function addToQueue(songs, member) {
    // if the input is a query convert it to an array
    if (!Array.isArray(songs)) {
        songs = [{query: songs, member: member}];
    }

    for (let song of songs) {
        await queue.addSongs(song.query, song.member);
    }

    eventEmitter.emit("queueChange", queue);
}

function removeFromQueue(...indices) {
    queue.removeSongs(...indices);
    eventEmitter.emit("queueChange", queue);
}

function removeFromQueueByMember(member) {
    queue.removeByMember(member);
    eventEmitter.emit("queueChange", queue);
}

function clearQueue() {
    //TODO change to a general stop function which also handles stuff like emitting event for updating the ui
    stopStream();
    queue.clear();
    // updateQueueDisplay();
    eventEmitter.emit("queueChange", queue);
}

function getQueueLength() {
    return queue.getSongAmount();
}

async function joinChannel(channel) {
    if (isInVoiceChannel()) {
        leaveChannel();
    }

    let connection = await channel.join();
    voiceChannel = connection.channel;
    voiceConnection = connection;

    client.on("voiceStateUpdate", handleVoiceStateChange);
    eventEmitter.emit("join");
}

function leaveChannel() {
    if (voiceChannel) {
        //stop();
        stopStream();
        voiceChannel.leave();
        voiceChannel = undefined;
        voiceConnection = undefined;
        dispatcher = undefined;
        eventEmitter.emit("leave");
        client.removeListener("voiceStateUpdate", handleVoiceStateChange);
    }
}

function handleVoiceStateChange(oldState, newState) {
    // someone leaves the current channel
    if (newState.channelID !== oldState.channelID && oldState.channelID === voiceChannel.id) {
        handleLeave(oldState);
        return;
    }

    // someone joins the current channel
    if (newState.channelID === voiceChannel.id) {
        handleJoin();
    }
}

async function handleLeave(oldState) {
    let channel = await client.channels.fetch(oldState.channelID);
    console.log(`voice channel has ${channel.members.filter(value => !value.user.bot).size} members`);
    if (channel.members.filter((value) => !value.user.bot).size === 0) {
        eventEmitter.emit("showLeaveChannelTimer");
        leaveChannelTimer = setTimeout(() => {
            leaveChannel();
            eventEmitter.emit("hideLeaveChannelTimer");
        }, 60000);
    }
}

function handleJoin() {
    clearTimeout(leaveChannelTimer);
    eventEmitter.emit("hideLeaveChannelTimer");
}

function isInVoiceChannel() {
    return !!voiceChannel;
}

async function search(query, msg) {
    let results = await ytSearch(query);
    results = results.videos.slice(0, 20);

    eventEmitter.emit("showSearchUI", msg.author, results);
}

async function setTextChannel(channel) {
    textChannel = channel;

    eventEmitter.emit("changeTextChannel", channel);
}

module.exports = eventEmitter;

module.exports.joinChannel = joinChannel;
module.exports.leaveChannel = leaveChannel;
module.exports.addToQueue = addToQueue;
module.exports.removeFromQueue = removeFromQueue;
module.exports.clearQueue = clearQueue;
module.exports.getQueueLength = getQueueLength;
module.exports.changeVolume = changeVolume;
module.exports.getVolume = getVolume;
module.exports.back = back;
module.exports.skip = skip;
module.exports.goToSong = goToSong;
module.exports.cycleLoop = cycleLoop;
module.exports.setLoop = setLoop;
module.exports.play = play;
module.exports.pause = pause;
module.exports.togglePause = togglePause;
module.exports.isStreamRunning = isStreamRunning;
module.exports.search = search;

module.exports.startStream = startStream;
module.exports.stopStream = stopStream;
module.exports.nextSong = nextSong;
module.exports.queue = queue;
module.exports.setTextChannel = setTextChannel;