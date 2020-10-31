const UIComponent = require("./uiComponent");
const util = require("../util/util");

const logoUrl = "https://cdn.discordapp.com/app-icons/483665807184887808/fc97f1fbfdf28a9516aa4d84268ccb9f.png";

const defaultColor = 0x0000ff;

class UICurrentSong extends UIComponent {

    #currentSong;
    #color = defaultColor;
    #progress = -1;
    #queueAmount = -1;
    #queueLength = 0;

    constructor(channel) {
        super(channel, ["🔀", "⏮", "⏯", "⏭", "🔁"]);

        this.updateUI();
    }

    updateUI() {
        let currentPlayingDisplay = this.#currentSong ? this.#currentSong.title : "-";
        let addedByDisplay = this.#currentSong ? this.#currentSong.member.displayName : "-";
        let imageUrl = this.#currentSong && this.#currentSong.imageUrl ? this.#currentSong.imageUrl : logoUrl;
        let progressDisplay;
        let totalLength = this.#queueAmount > 0 ? util.convertSecondsToTimeString(this.#queueLength) : "-";

        if (!this.#currentSong) {
            this.#color = defaultColor;
        }

        if (this.#progress < 0 || this.#queueAmount <= 0) {
            progressDisplay = "-";
        } else {
            progressDisplay = `${this.#progress}/${this.#queueAmount}`;
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
                    name: "Queue Progress",
                    value: progressDisplay,
                    inline: true
                }, {
                    name: "Added by:",
                    value: addedByDisplay,
                    inline: true
                }, {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                }, {
                    name: "Queue Length",
                    value: totalLength,
                    inline: true
                }]
            }
        });
    }

    update(data) {
        if (data.song) this.#currentSong = data.song;
        if (data.progress) this.#progress = data.progress;
        if (data.queueLength) this.#queueLength = data.queueLength;
        if (data.queueAmount) this.#queueAmount = data.queueAmount;
        if (data.color) this.#color = data.color;

        this.updateUI();
    }
}

module.exports = UICurrentSong;