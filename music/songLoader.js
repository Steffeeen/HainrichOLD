const fs = require("fs");
const fsPromise = fs.promises;
const path = require("path");
const ytdl = require("ytdl-core");

let downloadQueue = [];

let queueWorkerRunning = false;

// the song that is currently being downloaded
let currentlyDownloading;

// the promise returned by downloadSong of the currently downloading song
let currentDownloadingPromise;

clearDirectory();

async function getFile(song) {
    let file;
    let fromDisk = await getFileFromDisk(song);
    if (fromDisk) {
        file = fromDisk;
    } else if (isSongCurrentlyDownloading(song)) {
        file = await currentDownloadingPromise;
    } else {
        file = await downloadSong(song);
    }

    return path.resolve(`${config.songCacheLocation}/${file}`);
}

async function getFileFromDisk(song) {
    let files = await fsPromise.readdir(config.songCacheLocation);

    return files.find((file) => file === song.uuid);
}

function isSongCurrentlyDownloading(song) {
    return currentlyDownloading.uuid === song.uuid;
}

function queueSong(song, highPriority = false) {
    if (highPriority) {
        downloadQueue.unshift(song);
    } else {
        downloadQueue.push(song);
    }
    checkQueue();
}

async function checkQueue() {
    if (queueWorkerRunning) {
        return;
    }

    queueWorkerRunning = true;

    while (downloadQueue.length !== 0) {
        let song = downloadQueue.shift();
        await downloadSong(song);
    }

    queueWorkerRunning = false;
}

async function downloadSong(song) {
    const path = `${config.songCacheLocation}/${song.uuid}`;
    let promise = new Promise((resolve, reject) => {
        let stream = ytdl(song.url, {filter: "audioonly", quality: "highestaudio"});
        stream.pipe(fs.createWriteStream(path));
        stream.on("end", () => {
            resolve(path);
            currentlyDownloading = undefined;
            currentDownloadingPromise = undefined;
        });
        stream.on("error", (e) => {
            reject(e);
            currentlyDownloading = undefined;
            currentDownloadingPromise = undefined;
        });
    });
    currentlyDownloading = song;
    currentDownloadingPromise = promise;
    return promise;
}

function clearDirectory() {
    fs.rmdirSync(config.songCacheLocation, {recursive: true});
    fs.mkdirSync(config.songCacheLocation);
}

module.exports.getFile = getFile;
module.exports.queueSong = queueSong;