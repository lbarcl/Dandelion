const mongo = require('../../../../utils/database/mongo')
const {MessageEmbed} = require('discord.js')

module.exports = {
  name: 'çalmalisteleri',
  aliases: ['çl'],
  maxArgs: 1,
  description: 'Girilen kullanıcının yada komutu kullanan kişinin çalma listelerini gösterir',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}çalmalisteleri [@kullanıcı (opsiyonel)]` yazmanız yeterli",
  callback: async ({ message, client }) => {
        var list
        var selfUser = false
        var requestedUser = message.mentions.users.first() || message.author
        if (requestedUser.id == message.author.id) selfUser = true
        await mongo().then(async mongoose => {
            try {
                if (selfUser) list = await client.DBPlaylist.find({'info.owner': requestedUser.id})
                else if (!selfUser) list = await client.DBPlaylist.find({'info.owner': requestedUser.id, 'settings.private': false})

                if (!list[0]) return message.reply('Her hangi bir çalmalisltesi bulunamadı')
                embed(list, message, client)
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz kişi çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })
    }
}

async function embed(playlists, message, client) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.avatarURL())
      .setTitle(`${client.users.cache.get(playlists[0].info.owner).username} ait çalma listeleri`)
      .setColor(playlists[0].settings.color || client.config.embed.color)
    for (var x = 0; x < playlists.length; x++) {
      embed.addField(playlists[x].info.title, `ID ${playlists[x]._id} | Şarkı sayısı ${playlists[x].items.length}`)
      if (x == 25) {
        for (var y = 0; y < 25; y++) {
          playlists.shift();
        }
        message.channel.send(embed)
        embed(list, message, index, client)
      }
    }
    message.channel.send(embed)
  }