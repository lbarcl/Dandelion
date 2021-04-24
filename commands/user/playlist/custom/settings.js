const mongo = require('../../../../utils/database/connect')
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'listeayarları',
    aliases: ['la'],
    minArgs: 1,
    description: 'Çalmalistesi ayarlarını gösterir, eğer 2.parametre olarak [gizlilik/açıklama/renk/başlık] yazar iseniz ayarları değiştirebilirsiniz',
    expectedArgs: '[s/b/ID] (opsiyonel [gizlilik/açıklama/renk/başlık] [ayar için gerekli değer (gizlilik ayarında gerekli değil)]',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}listeayarları [s/b/ID]` yazmanız yeterli",
    callback: async ({ message, client, args }) => {
        var ID, notFoundText, list, type
        switch (args[0]) {
            case 's':
                ID = message.guild.id
                notFoundText = `${message.guild.name} sunucusunun bir listesi yok`
                type = 'server'
                if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply('Bunu görüntülemek için izniniz yok')
                break;
            case 'b':
                ID = message.author.id
                notFoundText = `${message.author.username} beğendiği şarkı yok`
                type = 'favs'
                break;
            default:
                ID = args[0]
                notFoundText = `\`${args[0]}\` ile bir liste bulmadık, geçerli bir ID verdiğinizden emin olun`
                type = 'custom'
        }

        await mongo().then(async mongoose => {
            try {
                list = await client.DBPlaylist.findOne({ _id: ID, 'info.type': type })
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })

        if (!list) return message.reply(notFoundText)
        if (list.settings.private && list.info.owner != message.author.id) return message.reply('Bu listenin ayarlarını görmek için yetkiniz yok')
        const embed = new MessageEmbed()
        if (!args[1]) {
            embed.setTitle(`${list.info.title} ayarları`)
            embed.setColor(list.settings?.color || client.servers[message.guild.id].embedInfo.hexColor)
            embed.setDescription(list.info.description || `Bu çalma listesi için bir açıklama yok`)
            embed.addField(`Gizlilik ${list.settings.private}`, '\u200B')
            if (list.settings.color) embed.addField(`Renk kodu ${list.settings.color}`, '\u200B')
            else embed.addField(`Renk yok`, '\u200B')
            if (list.settings.image) embed.setImage(list.settings.image)
            else embed.addField(`Resim yok`, '\u200B')
            message.channel.send(embed)
        } else {
            const mongoose = await mongo()
            switch (args[1]) {
                case 'gizlilik':
                    await client.DBPlaylist.findOneAndUpdate({ _id: ID, 'info.type': type }, { 'settings.private': !list.settings.private })
                    message.reply(`Liste gizlilik ayarı ${!list.settings.private} olarak ayarlandı`)
                    break;
                case 'açıklama':
                    args.splice(0, 2)
                    var description = args.join(' ')
                    await client.DBPlaylist.findOneAndUpdate({ _id: ID, 'info.type': type }, { 'info.description': description })
                    message.reply('Açıklama değiştirildi')
                    break;
                case 'renk':
                    await client.DBPlaylist.findOneAndUpdate({ _id: ID, 'info.type': type }, { 'settings.color': args[2] })
                    message.reply('Renk değiştirildi')
                    break;
                case 'başlık':
                    args.splice(0, 2)
                    var description = args.join(' ')
                    await client.DBPlaylist.findOneAndUpdate({ _id: ID, 'info.type': type }, { 'info.title': description })
                    message.reply('Başlık değiştirildi')
                    break;
            }
            mongoose.connection.close()
        }
    }
}