//* Importing required modules
const embedEditor = require('../../utils/DesignEmbed');
const SendDelete = require('../../utils/Send&Delete');
const DPlayer = require('../../Class/DiscordPlayer')

module.exports = (client, instance) => {
    //* Registering on message event 
    client.on('messageCreate', async message => {
        //* Getting guild data from cache
        const guildData = client.guildData.get(message.guild.id)

        //* Checking for is user able to use it
        if (message.author.id == client.user.id) return
        else if (!guildData.message && guildData.channel) guildData.Load(client, client.config)
        else if (!guildData?.channel) return
        else if (guildData?.channel.id != message.channel.id) return
        else if (message.content.slice(0, 1) == instance._defaultPrefix) {
            message.delete()
            message.author.send(`Lütfen ${client.config.embed.title} kanalında komut çalıştırmayın`);
            return
        }
        else if (message.author.bot) {
            message.delete()
            SendDelete('Lütfen bu kanalda diğer botları kullanmayın', message.channel, 5000, { type: 'embedWarning' });
            return
        } else if (!message.member.voice?.channel) {
            SendDelete('Botu kullanabilmek için bir ses kanalına bağlı olmalısınız', message.channel, 5000, { type: 'embedWarning' });
            return
       }

        //* Deleting message after 250ms 
        setTimeout(() => {
            message.delete()
        }, 2500);

        const { Songs } = await client.getData.fromMessage(message)

        if (guildData.player?.voiceConnection) {
            console.log(guildData.player.Songs.length)
            if (guildData.player.Songs.length == 0) {
                guildData.player.Songs = Songs
                guildData.player.play()
            } else {
                guildData.player.Songs = guildData.player.Songs.concat(Songs)
                guildData.updateEmbed(embedEditor(guildData.player))
            }
        } else {
            guildData.player = new DPlayer(guildData)
            if (!message.member.voice.channel.joinable) {
                SendDelete(`<@${client.user.id}>, <#${message.member.voice.channel.id}>'ye bağlanamıyor!\nLütfen başka bir kanala geçin yada yetki verin.`, message.channel, 5000, { type: 'embedWarning' })
            } else {
                guildData.player.connect(message.member.voice.channel)
                guildData.player.Songs = Songs
                guildData.player.StartPlayer()
            }
        }
    });
}
