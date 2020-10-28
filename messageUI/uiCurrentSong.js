const UIComponent = require("./uiComponent");
const util = require("../util/util");

const logoUrl = "https://cdn.discordapp.com/app-icons/483665807184887808/fc97f1fbfdf28a9516aa4d84268ccb9f.png";

const defaultColor = 0x0000ff;

class UICurrentSong extends UIComponent {

    #currentSong;
    #color = defaultColor;
    #progress = -1;

    constructor(channel, currentSong) {
        super(channel, ["🔀", "⏮", "⏯", "⏭", "🔁"]);

        this.setCurrentSong(currentSong);
    }

    setCurrentSong(song) {
        this.#currentSong = song;

        let currentPlayingDisplay = this.#currentSong ? this.#currentSong.title : "-";
        let addedByDisplay = this.#currentSong ? this.#currentSong.member.displayName : "-";
        let imageUrl = this.#currentSong && this.#currentSong.imageUrl ? this.#currentSong.imageUrl : logoUrl;
        let progressDisplay;

        if (!this.#currentSong) {
            this.#color = defaultColor;
        }

        if (this.#progress < 0) {
            progressDisplay = "-";
        } else {
            progressDisplay = util.convertSecondsToTimeString(this.#progress);
        }

        this.setContent({
            embed: {
                color: this.#color,
                thumbnail: {
                    url: imageUrl,
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



module.exports = UICurrentSong;