const SendDelete = require("../../utils/Send&Delete")

module.exports = (client, instance) => {
    client.on('messageReactionAdd', (reaction, user) => {
        const message = reaction.message
        const emoji = reaction.emoji.name
        const guildData = client.guildData.get(message.guild.id)
        const member = message.guild.members.cache.get(user.id)

        if (!guildData.message && guildData.channel) guildData.Load(client, client.config)

        if (user.id == client.user.id) return
        else if (guildData.message?.id != message.id) return
        
        reaction.users.remove(user)
        
        if (!guildData?.player) return SendDelete(client.user.username + ' bir ses kanalına bağlı değil', message.channel, 2500, { type: 'embedWarning' });
        else if (!member.voice.channelId) return SendDelete('Reaksiyonları kullanabilmek için ses kanalında olmanız gerekiyor', message.channel, 2500, {type: 'embedWarning'});
        else if (member.voice.channelId != guildData.player?.channel.id) return SendDelete('Reaksiyonları kullanabilmek için aynı ses kanalında olmanız gerekiyor', message.channel, 2500, {type: 'embedWarning'});
        
        switch (emoji) {
            case '⏯️':
                guildData.player.paunp()
                break;
            case '⏭️':
                guildData.player.skip(true)
                break;
            case '⏏️':
                guildData.player.quit(true)
                break;
            case '🔁':
                guildData.player.loop()
                break;
            case '🔀':
                guildData.player.shuffle()
                break;
            case '🆑':
                guildData.player.clear()
                break;
        }
    })
}
