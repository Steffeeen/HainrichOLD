const PlaylistSummary = require("youtube-playlist-summary");
const SpotifyWebApi = require("spotify-web-api-node");
const ytSearch = require("yt-search");
const util = require("util");

const YOUTUBE_VIDEO_REGEX = /^(https?:\/\/)?(www.)?((youtu.be\/\w{11})|(youtube.com\/watch\?v=\w{11}))/;
const YOUTUBE_PLAYLIST_REGEX = /^(https?:\/\/)?(www.)?youtube.com\/playlist\?list=[\w\-]{34}/;

const SPOTIFY_LINK_TRACK_REGEX = /^(https?:\/\/)open.spotify.com\/track\/\w{22}/;
const SPOTIFY_LINK_ALBUM_REGEX = /^(https?:\/\/)open.spotify.com\/album\/\w{22}/;
const SPOTIFY_LINK_PLAYLIST_REGEX = /^(https?:\/\/)open.spotify.com\/playlist\/\w{22}/;

const SPOTIFY_TRACK_REGEX = /(?:spotify:track:)(\w{22})/;
const SPOTIFY_ALBUM_REGEX = /(?:spotify:album:)(\w{22})/;
const SPOTIFY_PLAYLIST_REGEX = /(?:spotify:playlist:)(\w{22})/;

const YOUTUBE_PLAYLIST_ID_REGEX = /(?:list=)([\w\-]{34})/;

// these can probably be combined with the other spotify link regexes
const SPOTIFY_LINK_TRACK_ID_REGEX = /(?:track)(?:\/)(\w{22})/;
const SPOTIFY_LINK_ALBUM_ID_REGEX = /(?:album)(?:\/)(\w{22})/;
const SPOTIFY_LINK_PLAYLIST_ID_REGEX = /(?:playlist)(?:\/)(\w{22})/;

const ytConfig = {
    GOOGLE_API_KEY: process.env.YOUTUBE_TOKEN
}
const youtubePlaylists = new PlaylistSummary(ytConfig);

let spotifyTokenExpireDate = 0;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENTID,
    clientSecret: process.env.SPOTIFY_SECRET
});

loadSpotifyToken();

async function loadSpotifyToken() {
    if (Date.now() - 10000 < spotifyTokenExpireDate) {
        return;
    }

    let data = await spotifyApi.clientCredentialsGrant();
    console.log(`The access token expires in ${data.body["expires_in"]}`);
    spotifyApi.setAccessToken(data.body["access_token"]);
    spotifyTokenExpireDate = Date.now() + data.body["expires_in"];
}

async function getYoutubeSearchResults(query) {
    if (YOUTUBE_VIDEO_REGEX.test(query)) {
        return [{
            url: query
        }];
    }

    if (YOUTUBE_PLAYLIST_REGEX.test(query)) {
        return getYoutubePlaylistLinks(query);
    }

    if (SPOTIFY_LINK_TRACK_REGEX.test(query) || SPOTIFY_TRACK_REGEX.test(query)) {
        return getSpotifyTrackLink(query);
    }

    if (SPOTIFY_LINK_ALBUM_REGEX.test(query) || SPOTIFY_ALBUM_REGEX.test(query)) {
        return getSpotifyAlbumLinks(query);
    }

    if (SPOTIFY_LINK_PLAYLIST_REGEX.test(query) || SPOTIFY_PLAYLIST_REGEX.test(query)) {
        return getSpotifyPlaylistLinks(query);
    }

    return [await getYoutubeSearchLink(query)];
}

async function getYoutubeVideoLink(link) {
    return link.match(YOUTUBE_VIDEO_REGEX);
}

async function getYoutubePlaylistLinks(link) {
    let playlistId = link.match(YOUTUBE_PLAYLIST_ID_REGEX)[1];
    let result = await youtubePlaylists.getPlaylistItems(playlistId);
    return result.items.map(item => item.videoUrl);
}

async function getSpotifyTrackLink(link) {
    let trackId;
    if (SPOTIFY_TRACK_REGEX.test(link)) {
        // idk if there's a better way
        trackId = link.match(SPOTIFY_TRACK_REGEX)[1];
    }

    if (SPOTIFY_LINK_TRACK_REGEX.test(link)) {
        // idk if there's a better way
        trackId = link.match(SPOTIFY_LINK_TRACK_ID_REGEX)[1];
    }

    return [await getLinkFromSpotifyTrackId(trackId)];
}

async function getLinkFromSpotifyTrackId(trackId) {
    await loadSpotifyToken();
    let track = await spotifyApi.getTrack(trackId);
    let trackName = track.body.name;
    let artists = track.body.artists.map(artist => artist.name);
    return await getYoutubeLinkByNameAndArtists(trackName, artists);
}

async function getSpotifyAlbumLinks(link) {
    let albumId;

    if (SPOTIFY_ALBUM_REGEX.test(link)) {
        // idk if there's a better way
        albumId = link.match(SPOTIFY_ALBUM_REGEX)[1];
    }

    if (SPOTIFY_LINK_ALBUM_REGEX.test(link)) {
        // idk if there's a better way
        albumId = link.match(SPOTIFY_LINK_ALBUM_ID_REGEX)[1];
    }

    return getLinksFromSpotifyAlbumId(albumId);
}

async function getLinksFromSpotifyAlbumId(albumId) {
    await loadSpotifyToken();
    let album = await spotifyApi.getAlbum(albumId);
    let tracks = album.body.tracks.items;

    return await getLinksFromSpotifyTrackList(tracks);
}

async function getSpotifyPlaylistLinks(link) {
    let playlistId;

    if (SPOTIFY_PLAYLIST_REGEX.test(link)) {
        // idk if there's a better way
        playlistId = link.match(SPOTIFY_PLAYLIST_REGEX)[1];
    }

    if (SPOTIFY_LINK_PLAYLIST_REGEX.test(link)) {
        // idk if there's a better way
        playlistId = link.match(SPOTIFY_LINK_PLAYLIST_ID_REGEX)[1];
    }

    return getLinksFromSpotifyPlaylistId(playlistId);
}

async function getLinksFromSpotifyPlaylistId(playlistId) {
    await loadSpotifyToken();
    let playlist = await spotifyApi.getPlaylist(playlistId);
    let tracks = playlist.body.tracks.items;

    return await getLinksFromSpotifyTrackList(tracks.map(track => track.track));
}

async function getLinksFromSpotifyTrackList(tracks) {
    let promises = [];

    for (let track of tracks) {
        let trackName = track.name;
        let artists = track.artists.map(artist => artist.name);
        promises.push(getYoutubeLinkByNameAndArtists(trackName, artists));
    }

    let links = await Promise.allSettled(promises);

    return links.map(link => link.value);
}

async function getYoutubeLinkByNameAndArtists(trackName, artists) {
    return getYoutubeSearchLink(`${trackName} ${artists.join(" ")}`);
}

async function getYoutubeSearchLink(query) {
    let result = await ytSearch(query);
    return {
        url: result.videos[0].url,
        ytQuery: query
    };
}

module.exports.getYoutubeSearchResults = getYoutubeSearchResults;