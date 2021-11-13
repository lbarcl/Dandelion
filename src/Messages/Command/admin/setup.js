const { MessageEmbed } = require('discord.js')
const { db, GuildSchema } = require('../../../Database');

module.exports = {
    name: 'kurulum',
    category: 'Admin',
    aliases: ['kurulum', 'kr'],

    minArgs: 0,
    guildOnly: true,
    permissions: ['MANAGE_GUILD'],

    description: 'Dandelionun kurulumunu yapar. Her sunucu için bir defa',
    syntaxError: 'Yanlış kullanım, sadece "{PREFIX}"kurulum yazmanız yeterli',
    callback: async ({ channel, guild, client }) => {
        const guildData = client.guildData.get(guild.id);
        if (guildData.channel) {
            channel.send('Bu sunucuda zaten papatya var')
            return
        }

        channel.send('Kuruluma başlanıyor')
        var flag = 0;

        const PapatyaChannel = await guild.channels.create(client.config.embed.title, { reason: `${client.config.embed.title} kontrolu için kuruldu` }).catch(err => {
            channel.send('Kanal oluştururken bir hata meydana geldi, hata: \n' + err)
            flag = 1;
        });

        if (flag == 1) return

        const papatya = new MessageEmbed()
            .setTitle(client.config.embed.title)
            .setColor(client.config.embed.hexColor)
            .setDescription(client.config.embed.description)
            .setImage(client.config.embed.image)

        const PapatyaMessage = await PapatyaChannel.send({ embeds: [papatya] }).catch(err => {
            channel.send('Mesaj gönderirken bir hata meydana geldi, hata: \n' + err);
            flag = 1;
        })

        if (flag == 1) return

        const emojis = ['⏯️', '⏭️', '⏏️', '🔁', '🔀', '🆑']
        emojis.forEach(async (emoji) => {
            await PapatyaMessage.react(emoji);
        })

        await new db(null, null, GuildSchema).save({
            _id: guild.id,
            channel: {
                id: PapatyaChannel.id,
                message: {
                    id: PapatyaMessage.id,
                }
            }
        }).catch(async err => {
            channel.send('Kurulum esnasında bir hata meydana geldi, hata: \n' + err)
            await PapatyaChannel.delete(`${client.config.embed.title}'ın kurulumu esnasında bir hata olduğu için silindi`)
            channel.send('Papatya kanalı silindi')
            flag = 1;
        })

        if (flag == 1) return

        guilData.Load(client, client.config)
        channel.send('Kurulum tamamlandı, papatyanızı güle güle kullanın');
    }
}