const connect = require('../../../utils/database/connect')
const mongo = require('../../../utils/database/info')
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'çalmalistesigöster',
    aliases: ['çlg'],
    minArgs: 1,
    maxArgs: 1,
    description: 'Çalmalistesi göstermek için 3 tane parametre girilebilir bunlar;\n`s` içerisinde bulunduğunuz sunucunun listesini görüntülemek için\n`b` kullanıcı beğenilenlerini görüntülemek için\n`çalma listesi ID` ID olarak verdiğiniz listeyi görüntüler',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}çalmalistesigöster [s/b/ID]` yazmanız yeterli",
    guildOnly: true,
    callback: async ({ message, client, args }) => {
        var ID, list, notFoundText, songs
        switch (args[0]) {
            case 's':
                ID = message.guild.id
                notFoundText = `${message.guild.name} sunucusunun bir listesi yok`
                break;
            case 'b':
                ID = message.author.id
                notFoundText = `${message.author.username} beğendiği şarkı yok`
                break;
            default:
                ID = args[0]
                notFoundText = `\`${args[0]}\` ile bir liste bulmadık, geçerli bir ID verdiğinizden emin olun`
        }

        await connect().then(async (mongoose) => {
            try {
                list = await client.DBPlaylist.findById(ID)
                songs = await client.DBSong.find({})
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })

        if (!list) return message.reply(notFoundText)
        var embed = new MessageEmbed()
        switch (list.info.type) {
            case 'server':
                embed.setTitle(`${message.guild.name} sunucusunun listesi`)
                embed.setColor(list.settings.color || client.servers[message.guild.id].embedInfo.hexColor)
                embed.setDescription(list.info.description || `\`${list.items.length}\` adet şarkı`)
                if (list.settings.image) embed.setThumbnail(list.settings.image)
                break;
            case 'favs':
                embed.setTitle(`${message.author.username} tarafından beğenilenler`)
                embed.setColor(list.settings.color || client.servers[message.guild.id].embedInfo.hexColor)
                embed.setDescription(list.info.description || `\`${list.items.length}\` adet şarkı`)
                if (list.settings.image) embed.setThumbnail(list.settings.image)
                break;
            case 'custom':
                if (list.settings.private && message.author.id != list.info.owner) return message.reply('Üzgünüm ama bu listeyi görmek için izniniz yok')
                embed.setTitle(list.info.title)
                embed.setAuthor(client.users.cache.get(list.info.owner).username, client.users.cache.get(list.info.owner).avatarURL())
                embed.setColor(list.settings.color || client.servers[message.guild.id].embedInfo.hexColor)
                embed.setDescription(list.info.description || `\`${list.items.length}\` adet şarkı`)
                if (list.settings.image) embed.setThumbnail(list.settings.image)
                break;
        }

        var songsOnPlaylist = []
        for (var x = 0; x < list.items.length; x++) {
            var flag = false
            for (var y = 0; y < songs.length; y++) {
                if (list.items[x] == songs[y].url) {
                    songsOnPlaylist.push(songs[y])
                    flag = true
                    break
                }
            }
            if (!flag) {
                var video = await mongo.videoInfoFind(list.items[x])
                songsOnPlaylist.push(video)
                continue
            }
        }

        embedContiune(embed, songsOnPlaylist, 1, message)
    }
}

function embedContiune(embed, list, index, message) {
    for (var i = 0; i < list.length; i++) {
        embed.addField(`${index} - ${list[i].title}`, `[YouTube ile aç](${list[i].url})`)
        index++
        if (i == 25 && list.length > 25) {
            list.splice(0, 25)
            embed.setFooter(`Sayfa ${parseInt(index / 25)}`)
            message.channel.send(embed)
            embed.setDescription()
            embedContiune(embed, list, index, message)
        }
    }
    message.channel.send(embed)
}