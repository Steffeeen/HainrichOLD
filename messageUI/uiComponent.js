const EventEmitter = require("events");
const config = require("../config.json");

class UIComponent extends EventEmitter {

    constructor(channel, reactions) {
        super();
        this.channel = channel;
        this.content = "";
        this.reactions = reactions;

        this.messageID = null;
        this.collector = null;
        this.filter = (reaction, user) => this.reactions.includes(reaction.emoji.name) && !user.bot;
    }

    async sendMessage() {
        if (!this.channel) {
            return;
        }

        let messages = await this.channel.fetchMessages();

        if (!messages.get(this.messageID)) {
            this.channel.send(this.content).then(async message => {
                this.messageID = message.id;

                message.pin();

                this.changeReactions(this.reactions);
                this.collector = message.createReactionCollector(this.filter);
                this.collector.on("collect", reaction => {
                    super.emit(reaction.emoji.name);
                    console.log(reaction.emoji.name);
                    reaction.fetchUsers(5).then(users => {
                        let remove = [];

                        for(let user of users.array()) {
                            if(!user.bot) {
                                remove.push(user);
                            }
                        }

                        for(let user of remove) {
                            reaction.remove(user);
                        }
                    });
                });
            });
        } else {
            let message = this.channel.messages.array().find(message => message.id === this.messageID);
            message.edit(this.content);
        }
    }

    deleteMessage() {
        if(this.messageID) {
            let message = this.channel.messages.array().find(message => message.id === this.messageID);
            message.delete();
        }
    }

    async setContent(content) {
        this.content = content;
        await this.sendMessage();
    }

    async changeReaction(index, newReaction) {
        this.reactions[index] = newReaction;

        let message = this.channel.messages.array().find(message => message.id === this.messageID);

        for (let i = index; i < message.reactions.array().length; i++) {
            let reaction = message.reactions.array()[message.reactions.array().length - 1];
            await reaction.fetchUsers(5).then(users => reaction.remove(users.array()[users.array().length - 1]));
        }

        for (let i = index; i < this.reactions.length; i++) {
            await message.react(this.reactions[i]);
        }
    }

    async changeReactions(reactions) {
        this.reactions = reactions;

        let message = this.channel.messages.array().find(message => message.id === this.messageID);

        for (let i = 0; i < message.reactions.array().length; i++) {
            let reaction = message.reactions.array()[this.message.reactions.array().length - 1];
            await reaction.fetchUsers(5).then(users => reaction.remove(users.array()[users.array().length - 1]));
        }

        for (let reaction of this.reactions) {
            await message.react(reaction);
        }
    }

    getID() {
        return this.messageID;
    }
}

module.exports = UIComponent;