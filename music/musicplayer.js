const ytdl = require("ytdl-core-discord");

let queue = [];
let channel;

exports.currentSong = "";

exports.startPlaying = () => {

};

exports.stopPlaying = () => {

};

exports.play = async (url) => {
    channel.connection.playOpusStream(await ytdl(url));
};

exports.addToQueue = (url) => {
    queue.push(url);
};

exports.removeFromQueue = (url) => {

};

exports.joinChannel = (voiceChannel) => {
    voiceChannel.join()
        .then(connection => {
        channel = connection.channel;
    })
        .catch(err => console.log(err));
};

exports.leaveChannel = () => {
    if(channel) {
        channel.leave();
    }
};
