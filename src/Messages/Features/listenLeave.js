const SendDelte = require('../../utils/Send&Delete')

module.exports = (client, instance) => {
    client.on('voiceStateUpdate', (OldState, NewState) => {
        if (OldState.channelId != null && NewState.channelId == null) {
            const guild = client.guildData.get(OldState.guild.id);
            if (guild.player) {
                if (OldState.id == client.user.id) {
                    guild.player = null
                    guild.DefaultEmbed()
                } else {
                    if (OldState.channelId == guild.player?.channel.id) {
                        const size = OldState.channel.members.size
                        if (size == 1) {
                            SendDelte('Kanalda kimse kalmadığı için ayrılıyorum', guild.channel, 2500);
                            guild.player.quit()
                            guild.player = null
                        }
                    }
                }
            }
        } else if (OldState.channelId != null && OldState.channelId != NewState.channelId && OldState.id == client.user.id) {
            const guild = client.guildData.get(OldState.guild.id);
            guild.player.channel = NewState.channel
        }
    })
}