const UIComponent = require("./uiComponent");

class UIStatus extends UIComponent {

    #status = "";
    #color = 19673

    constructor(channel) {
        super(channel, []);

        this.setStatus(this.#status);
    }

    setStatus(status) {
        this.#status = status;

        this.setContent({
            embed: {
                color: this.#color,
                description: status,
            }});
    }

    setColor(color) {
        this.#color = color;
        this.setStatus(this.#status);
    }
}

module.exports = UIStatus;