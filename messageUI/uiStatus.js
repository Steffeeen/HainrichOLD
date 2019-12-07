const UIComponent = require("./uiComponent");

class UIStatus extends UIComponent {

    constructor(channel) {
        super(channel, []);

        this.status = "";
        this.color = 19673;

        this.setStatus(this.status);
    }

    setStatus(status) {
        this.status = status;

        this.setContent({
            embed: {
                color: this.color,
                description: status,
            }});
    }

    setColor(color) {
        this.color = color;
        this.setStatus(this.status);
    }
}

module.exports = UIStatus;