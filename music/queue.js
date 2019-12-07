const ytdl = require("ytdl-core");
const ytSearchCallback = require("yt-search");
const util = require("util");

const ytSearch = util.promisify(ytSearchCallback);

let queue = [];

let totalTime = 0;

let random = false;
let randomOrder = [];

//0 = no loop, 1 = loop queue, 2 = loop song
let loop = 0;

let currentSong = -1;

function getQueue() {
    return queue;
}

function getCurrentSong() {
    return getSong(currentSong);
}

function getCurrentSongIndex() {
    return currentSong;
}

function getSong(index) {
    if(random) {
        return queue[randomOrder[index]];
    }
    return queue[index];
}

function hasSong(index) {
    return !!queue[index];
}

function hasNext() {
    return !!getSong(currentSong + 1);
}

function hasPrevious() {
    return !!getSong(currentSong - 1);
}

//TODO add start at
async function addSong(query, member) {
    let urls = [];

    if(query.includes("youtube.com/watch")) {
        urls.push(query);
    } else if(query.includes("youtube.com/playlist")) {
        //TODO
    } else if(query.includes("open.spotify.com/playlist")) {
        //TODO
    } else {
        let result = await ytSearch(query);
        urls.push("https://www.youtube.com" + result.videos[0].url);
    }

    for(let url of urls) {
        let allInfo = await ytdl.getBasicInfo(url);
        let info = allInfo.player_response.videoDetails;
        //console.log(JSON.stringify(info.player_response.videoDetails));
        console.log(JSON.stringify(info));
        if(random) {
            let remaining;
            if(loop === 0 || loop === 2) {
                remaining = (queue.length - 1) - currentSong;
            } else if(loop === 1) {
                remaining = queue.length;
            }

            let index = Math.floor((Math.random() * remaining) + currentSong + 1);
            randomOrder.splice(index, 0, queue.length);
        }
        totalTime += info.lengthSeconds;
        queue.push({url: url, title: info.title, length: info.lengthSeconds, start: 0, member: member});

        console.log("queue total length: " + totalTime);
    }
}

function removeSongByUrl(url) {
    let songs = queue.splice(queue.indexOf(url), 1);
    totalTime -= songs[0].length;
}

function removeSongByIndex(index) {
    if(index >= 0 && index < queue.length) {
        let songs = queue.splice(index, 1);
        totalTime -= songs[0].length;
    }
}

function clear() {
    queue = [];
    setRandom(random);
    randomOrder = [];
    currentSong = -1;
}

function reset() {
    clear();
    loop = 0;
    setRandom(false);
}

function getNextSongToPlay() {
    if(loop === 2) {
        return getSong(currentSong);
    } else {
        return goToNextSong();
    }
}

function goToSong(index) {
    console.log("index: " + index);

    if(index < 0 || index >= queue.length) {
        console.log("index smaller than 0 or greater than queue length");
        return;
    }

    //End of queue without looping
    if(loop === 0 && index >= queue.length) {
        console.log("end of queue without looping");
        return;
    }

    //End of queue with looping
    if(loop === 1 && index >= queue.length) {
        console.log("end of queue with looping");
        currentSong = 0;
        return getSong(currentSong);
    }

    currentSong = index;
    return getSong(currentSong);
}

function goToNextSong() {
    return goToSong(currentSong + 1);
}

function goToPrevSong() {
    return goToSong(currentSong - 1);
}

function setRandom(r) {
    random = r;

    if(random) {
        randomOrder = [];

        let numbers = [];
        for(let i = 0; i < 20; i++) {
            numbers.push(i);
        }

        let length = numbers.length;

        for(let i = 0; i < length; i++) {
            let index = Math.floor(Math.random() * numbers.length);
            randomOrder.push(numbers[index]);
            numbers.splice(index, 1);
        }
    } else {
        randomOrder = [];
    }
}

function toggleRandom() {
    setRandom(!random);
    return random;
}

function setLoop(l) {
    loop = l;
}

function cycleLoop() {
    setLoop(loop + 1);
    if(loop === 3) {
        setLoop(0);
    }
    return loop;
}

module.exports = {
    getCurrentSong: getCurrentSong,
    getCurrentSongIndex: getCurrentSongIndex,
    addSong: addSong,
    removeSongByIndex: removeSongByIndex,
    removeSongByUrl: removeSongByUrl,
    getQueue: getQueue,
    clear: clear,
    setRandom: setRandom,
    toggleRandom: toggleRandom,
    setLoop: setLoop,
    cycleLoop: cycleLoop,
    goToSong: goToSong,
    goToNextSong: goToNextSong,
    goToPrevSong: goToPrevSong,
    getNextSongToPlay: getNextSongToPlay,
    getSong: getSong,
    hasSong: hasSong,
    hasNext: hasNext,
    hasPrevious, hasPrevious
};