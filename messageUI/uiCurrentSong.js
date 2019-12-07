const UIComponent = require("./uiComponent");

class UICurrentSong extends UIComponent {

    constructor(channel, currentSong) {
        super(channel, ["🔀", "⏮", "⏯", "⏭", "🔁"]);

        this.content = "";
        this.color = 19673;

        this.setCurrentSong(currentSong);
    }

    setCurrentSong(song) {
        this.currentSong = song;

        if(!this.currentSong) {
            this.setContent({
                embed: {
                    color: this.color,
                    fields: [{
                        name: "Currently playing:",
                        value: "-",
                        inline: true
                    }, {
                        name: "Added by:",
                        value: "-",
                        inline: true
                    }]
                }
            });
        } else {
            this.setContent({
                embed: {
                    color: this.color,
                    fields: [{
                        name: "Currently playing:",
                        value: this.currentSong.title
                    }, {
                        name: "Added by:",
                        value: this.currentSong.member.displayName,
                        inline: true
                    }]
                }
            });
        }
    }

    setColor(color) {
        this.color = color;
        this.setCurrentSong(this.currentSong);
    }
}

module.exports = UICurrentSong;