const UIComponent = require("./uiComponent");

class UICurrentSong extends UIComponent {

    #currentSong;
    #color = 0x0000ff;
    #progress = -1;

    constructor(channel, currentSong) {
        super(channel, ["🔀", "⏮", "⏯", "⏭", "🔁"]);

        this.setCurrentSong(currentSong);
    }

    setCurrentSong(song) {
        this.#currentSong = song;

        let currentPlayingDisplay = this.#currentSong ? this.#currentSong.title : "-";
        let addedByDisplay = this.#currentSong ? this.#currentSong.member.displayName : "-";
        let progressDisplay;

        if (this.#progress < 0) {
            progressDisplay = "-";
        } else {
            progressDisplay = getProgressDisplayString(this.#progress);
        }

        this.setContent({
            embed: {
                color: this.#color,
                thumbnail: {
                    url: 'https://i.imgur.com/wSTFkRM.png',
                },
                fields: [{
                    name: "Currently playing:",
                    value: currentPlayingDisplay,
                    inline: true
                }, {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                }, {
                    name: "Progress",
                    value: progressDisplay,
                    inline: true
                }, {
                    name: "Added by:",
                    value: addedByDisplay,
                    inline: true
                }]
            }
        });
    }

    setProgress(seconds) {
        this.#progress = seconds;
        this.setCurrentSong(this.#currentSong);
    }

    setColor(color) {
        this.#color = color;
        this.setCurrentSong(this.#currentSong);
    }
}

function getProgressDisplayString(progress) {
    let result = "";

    let hours = progress / 3600;
    if (hours >= 1) {
        result += addLeadingZero(Math.round(hours));
        result += ":";
    }

    let minutes = Math.floor(progress / 60) % 60
    result += addLeadingZero(minutes);
    result += ":";

    let seconds = progress % 60;
    result += addLeadingZero(seconds);

    return result;
}

function addLeadingZero(number) {
    if (`${number}`.length === 1) {
        return `0${number}`;
    }
    return number;
}

module.exports = UICurrentSong;