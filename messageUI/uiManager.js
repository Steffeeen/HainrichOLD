class UiManager {
    #channel;
    #components = [];

    constructor(channel) {
        clearMessages(channel).then(() => {
            this.#channel = channel;
            client.on("message", msg => handleMessage(msg, this.#channel));
        });
    }

    addComponent(component) {
        this.#components.push(component);
        component.sendMessage();
        component.on("contentChange", () => {
            component.sendMessage();
        });
    }

    removeComponent(component) {
        this.#components = this.#components.filter(item => item !== component);
        component.deleteMessage();
    }

    removeAll() {
        this.#components.forEach(component => this.removeComponent(component));
    }
}

async function handleMessage(msg, channel) {
    if (msg.channel.id !== channel.id) {
        return;
    }

    // don't delete pinned messages
    if (msg.pinned) {
        return;
    }

    // system messages, like when pinning a message get deleted immediately
    if (msg.system) {
        msg.delete();
        return;
    }

    if (msg.author.bot) {
        await sleep(10000);
        let newMsg = await channel.messages.fetch(msg.id, true);
        if (!newMsg.pinned) {
            msg.delete();
        }
    } else {
        msg.delete({timeout: 2000});
    }
}

async function clearMessages(channel) {
    await channel.bulkDelete(100);
}

module.exports = UiManager;