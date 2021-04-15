const mongo = require('../../../utils/database/mongo')
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
        var requestedUser = message.mentions.user.first() || message.author
        if (requestedUser.id == message.atuhor.id) selfUser = true
        await mongo().then(async mongoose => {
            try {
                if (selfUser) list = await client.DBPlaylist.find({ownerId: requestedUser.id})
                else if (!selfUser) list = await client.DBPlaylist.find({ownerId: requestedUser.id, private: false})
                console.log(list) 
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz kişi çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })
    }
}