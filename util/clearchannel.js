async function clearChannel(textChannel) {
    let cleared = 0;
    let messages = await textChannel.messages.fetch({limit: 100});

    while (messages.size > 0) {
        for (let key of messages) {
            key[1].delete()
                .then(() => cleared++)
                .catch(() => {
                });

            // can maybe be reduced, needs to be tested
            await sleep(300);
        }

        messages = await textChannel.messages.fetch({limit: 100})
            .catch(err => logger.error(err));
    }

    return cleared;
}

module.exports = clearChannel;
