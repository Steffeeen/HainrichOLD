module.exports = {
    name: "moveme",
    description: "moves the user to the bot's voice channel",
    permissionLevel: 2,
    run: (msg, args) => {
        let voiceChannel = msg.guild.member(client.user).voice.channel;
        if (!voiceChannel) {
            msg.channel.send("I'm not in a voice channel");
            return;
        }
        msg.member.voice.setChannel(voiceChannel).catch(err => logger.error(err));
    }
}