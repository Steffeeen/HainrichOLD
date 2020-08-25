const UIComponent = require("./uiComponent");

class UIList extends UIComponent {

    #listItems;
    #currentStart;
    #maxShownItems;
    #emptyMessage;

    constructor(channel, listItems, maxShownItems = 10, emptyMessage = "List is empty") {
        super(channel, ["⏬", "🔽", "🔼", "⏫"]);
        this.#maxShownItems = maxShownItems;
        this.#emptyMessage = emptyMessage;

        this.#currentStart = 0;

        this.setListItems(listItems);

        super.on("⏬", () => this.scrollToBottom());
        super.on("🔽", () => this.scrollDown());
        super.on("🔼", () => this.scrollUp());
        super.on("⏫", () => this.scrollToTop());
    }

    scrollUp() {
        let position = this.#currentStart - this.#maxShownItems;

        if(position >= 0) {
            this.goToPosition(position);
        }
    }

    scrollDown() {
        let position = this.#currentStart + this.#maxShownItems;

        if (position < this.#listItems.length) {
            this.goToPosition(position);
        }
    }

    scrollToTop() {
        this.goToPosition(0);
    }

    scrollToBottom() {
        let position = this.#listItems.length - this.#maxShownItems;

        this.goToPosition(position);
    }

    goToPosition(position) {
        this.#currentStart = position;

        let content = "```\n";
        for (let i = this.#currentStart; i < this.#currentStart + this.#maxShownItems; i++) {
            if (this.#listItems[i] !== undefined) {
                content += this.#listItems[i];
            }
            content += " \n";
        }
        content += "```";
        this.setContent(content);
    }

    setEmptyMessage(message) {
        this.#emptyMessage = message;

        if (this.#listItems.length === 0) {
            this.sendMessage();
        }
    }

    setListItems(listItems) {
        this.#listItems = listItems;
        this.#currentStart = 0;

        let content = "```\n";

        if (this.#listItems) {
            let iMax = Math.min(this.#listItems.length, this.#maxShownItems)

            for (let i = 0; i < iMax; i++) {
                content += this.#listItems[i] + " \n";
            }
            content += "```";
        } else {
            content = "```" + this.#emptyMessage + "```";
        }

        this.setContent(content);
    }
}

module.exports = UIList;