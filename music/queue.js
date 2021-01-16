const song = require("./song");
const {v4: uuidv4} = require("uuid");
const songLoader = require("./songLoader");

let queue = [];

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
async function addSongs(query, member) {
    let songs = await song.parseSongs(query, member);

    for (let song of songs) {
        song.uuid = uuidv4();
        queue.push(song);
        songLoader.queueSong(song);
    }

    updateRandomAfterAdding(songs.length);
}

function updateRandomAfterAdding(amount) {
    let remaining;
    // if the queue loops the new songs, can also be added at the start, if the queue does not loop only add the songs after the current one so they all get played
    if (loop === 0 || loop === 2) {
        remaining = (queue.length - 1) - currentSong;
    } else if (loop === 1) {
        remaining = queue.length;
    }

    for (let i = 0; i < amount; i++) {
        let index = Math.floor((Math.random() * remaining) + currentSong + 1);
        randomOrder.splice(index, 0, currentSong + i);
    }
}

function removeSongs(...indices) {
    queue = queue.filter((value, index) => !indices.includes(index));
    console.log("queue length:", queue.length);
}

function removeByMember(member) {
    queue = queue.filter(value => value.member !== member);
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

function getSongAmount() {
    return queue.length;
}

function getTotalLength() {
    if (isEmpty()) return 0;
    if (queue.length === 1) return queue[0].length;

    return queue.reduce((accu, curr) => accu + curr.length, 0);
}

function isEmpty() {
    return queue.length === 0;
}

function getNextSongToPlay() {
    if (loop === 2) {
        return getSong(currentSong);
    } else {
        return goToNextSong();
    }
}

function goToSong(index) {
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
    if (Number.isInteger(l)) {
        loop = l;
        return;
    }

    if (typeof l === "string") {
        switch (l) {
            case "none":
                loop = 0;
                break;
            case "queue":
                loop = 1;
                break;
            case "song":
                loop = 2;
                break;
        }
    }
}

function cycleLoop() {
    loop++;
    loop %= 3;
    setLoop(loop);
    return loop;
}

module.exports = {
    getCurrentSong: getCurrentSong,
    addSongs: addSongs,
    removeSongs: removeSongs,
    removeByMember: removeByMember,
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
    hasPrevious: hasPrevious,
    getProgress: getCurrentSongIndex,
    getSongAmount: getSongAmount,
    getTotalLength: getTotalLength,
    isEmpty: isEmpty,
};