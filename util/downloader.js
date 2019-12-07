const ytdl = require("ytdl-core");

function download(url) {
    return new Promise(resolve => {
        let stream = ytdl(url, {filter: "audioonly"});
        stream.on("end", () => {
            console.log("end");
            resolve(stream);
        });
    });
}

module.exports = download;