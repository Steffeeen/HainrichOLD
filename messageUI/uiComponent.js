const EventEmitter = require("events");

class UIComponent extends EventEmitter {

    #channel;
    #content;
    #reactions;
    #messageID;
    #collector;
    #filter = (reaction, user) => !user.bot && this.#reactions.includes(reaction.emoji.name);

    constructor(channel, reactions) {
        super();
        this.#channel = channel;
        this.#content = "";
        this.#reactions = reactions;
    }

    async sendMessage() {
        if (!this.#channel) {
            return;
        }

        if (!this.#messageID) {
            this.#channel.send(this.#content)
                .then(async message => {
                    this.#messageID = message.id;

                    message.pin();

                    this.changeReactions(this.#reactions);
                    this.#collector = message.createReactionCollector(this.#filter);
                    this.#collector.on("collect", reaction => {
                        super.emit(reaction.emoji.name);
                        console.log(reaction.emoji.name);
                        reaction.users.fetch({limit: 5})
                            .then(users => {
                                let remove = [];

                                for (let user of users.array()) {
                                    if (!user.bot) {
                                        remove.push(user);
                                    }
                                }

                                for (let user of remove) {
                                    reaction.users.remove(user);
                                }
                            });
                    });
                });
        } else {
            let message = await this.#channel.messages.fetch(this.#messageID, true);
            await message.edit(this.#content);
        }
    }

    async deleteMessage() {
        if (this.#messageID) {
            let message = await this.#channel.messages.fetch(this.#messageID, true);
            this.#messageID = undefined;
            message.delete();
        }
    }

    async setContent(content) {
        this.#content = content;
        super.emit("contentChange");
    }

    async changeReaction(index, newReaction) {
        this.#reactions[index] = newReaction;

        let message = await this.#channel.messages.fetch(this.#messageID, true);

        await message.reactions.removeAll();

        for (let i = index; i < this.#reactions.length; i++) {
            await message.react(this.#reactions[i]);
        }
    }

    async changeReactions(reactions) {
        this.#reactions = reactions;

        let message = await this.#channel.messages.fetch(this.#messageID, true);

        await message.reactions.removeAll();

        for (let reaction of this.#reactions) {
            await message.react(reaction);
        }
    }

    getID() {
        return this.#messageID;
    }
}

module.exports = UIComponent;