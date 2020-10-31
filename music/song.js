const linkResolver = require("./linkResolver");
const ytdl = require("ytdl-core");

const genius = require("genius-lyrics");
const Genius = new genius.Client(process.env.GENIUS_TOKEN);

async function parseSongs(query, member) {
    let ytResults = await linkResolver.getYoutubeSearchResults(query);

    let promises = [];

    for (let result of ytResults) {
        promises.push(getSongInfo(result, member));
    }

    let results = await Promise.allSettled(promises);

    return results.map(result => result.value);
}

async function getSongInfo(ytSearchInfo, member) {
    let results = await Promise.allSettled([ytdl.getBasicInfo(ytSearchInfo.url)/*, getCoverImageUrlByQuery(ytSearchInfo.ytQuery)*/]);

    results = results.map(result => result.value);
    let info = results[0].player_response.videoDetails;
    let imageUrl = results[1];

    return {
        url: ytSearchInfo.url,
        title: info.title,
        length: parseInt(info.lengthSeconds),
        start: 0,
        member: member,
        imageUrl: imageUrl
    };
}

async function getCoverImageUrlByQuery(query) {
    let songs = await Genius.tracks.search(query, {onlySongs: true, limit: 1});
    if (songs.length === 0) {
        return;
    }
    let song = songs[0];

    return song.thumbnail;
}

module.exports.parseSongs = parseSongs;