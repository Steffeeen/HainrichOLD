module.exports = {
    name: "deepclear",
    description: "Clears the entire current chat",
    aliases: ["dc"],
    permissionLevel: 2,
    args: [],
    subcommands: [],

    async run(msg) {
        let channel = msg.channel;

        let cleared = 0;

        let messages = await channel.messages.fetch({limit: 100});

        console.log("started deepclear");

        while (messages.size > 0) {
            for (let key of messages) {
                key[1].delete().catch(err => {
                    console.log("encountered error deleting: " + err)
                });

                await sleep(300);

                cleared++;
            }

            messages = await channel.messages.fetch({limit: 100}).catch(err => {
                console.log("encountered error fetching: " + err)
            });
            console.log(messages.size);

            console.log("cleared " + cleared);
        }

        console.log("finished deepclear");

        await channel.send("cleared " + cleared + " messages");

        /*while(messages.size > 0) {
            console.log(`Found ${messages.size} messages`);

            let amount = messages.size / 50;
            for(let i = 0; i < amount + 1; i++) {
                console.log(i);
                await channel.bulkDelete(50).catch(err => console.log(err));
            }

            messages = await textChannel.messages.fetch({limit: 100}, true);
        }*/
    }
};

async function clearMessages(count, msg) {
    let cleared = 0;

    for (let i = 0; i < count + 1; i++) {
        await msg.channel.bulkDelete(100, true).then(messages => {
            cleared += messages.size;
        });
    }
    return cleared;
}