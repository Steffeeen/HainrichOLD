const UIComponent = require("./uiComponent");

class UIList extends UIComponent {

    constructor(channel, listItems, maxShownItems = 10) {
        super(channel, ["⏬", "🔽", "🔼", "⏫"]);
        this.maxShownItems = maxShownItems;

        this.currentStart = 0;

        this.setListItems(listItems);

        super.on("⏬", () => this.scrollToBottom());
        super.on("🔽", () => this.scrollDown());
        super.on("🔼", () => this.scrollUp());
        super.on("⏫", () => this.scrollToTop());
    }

    scrollUp() {
        let position = this.currentStart - this.maxShownItems;

        if(position >= 0) {
            this.goToPosition(position);
        }
    }

    scrollDown() {
        let position = this.currentStart + this.maxShownItems;

        if(position < this.listItems.length) {
            this.goToPosition(position);
        }
    }

    scrollToTop() {
        this.goToPosition(0);
    }

    scrollToBottom() {
        let position = this.listItems.length - (this.listItems.length % 10);

        this.goToPosition(position);
    }

    goToPosition(position) {
        this.currentStart = position;

        let content = "```\n";
        for(let i = this.currentStart; i < this.currentStart + this.maxShownItems; i++) {
            if(this.listItems[i] !== undefined) {
                content += this.listItems[i];
            }
            content += " \n";
        }
        content += "```";
        this.setContent(content);
    }

    setListItems(listItems) {
        this.listItems = listItems;
        this.currentStart = 0;

        let iMax = 0;

        let content = "```\n";

        if(this.listItems) {
            if(this.listItems.length < this.maxShownItems) {
                iMax = this.listItems.length;
            } else {
                iMax = this.maxShownItems;
            }

            console.log(iMax);

            for(let i = 0; i < this.maxShownItems; i++) {
                if(this.listItems[i] !== undefined) {
                    content += this.listItems[i];
                }
                content += " \n";
            }
            content += "```";
        } else {
            content = "```List is empty```";
        }

        this.setContent(content);
    }
}

module.exports = UIList;