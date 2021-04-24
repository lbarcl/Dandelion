const mongo = require('../../utils/database/connect')

module.exports = {
  name: 'güncelle',
  aliases: ['güncelle', 'gl'],
  ownerOnly: true,
  minArgs: 0,
  hidden: true,
  description: 'Sadece bot sahibi tarafından kullanılabilen bot kanalı ve bot mesajını güncellemek için kullanılan komut',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}kurulum` yazmanız yeterli",
  callback: async ({ message, client }) => {
    const topicText = '[⏯️] Durdur/Devam | [⏭️] Sonraki şarkı | [⏏️] Kanaldan ayrıl | [🔀] Sırayı karıştırır | [🔁] Sırayı döngüye al/çıkar | [🆑] Sırayı temizle | [❤️] Çalan şarkıyı beğen/beğenme | [🗒️] Çalan şarkıyı sunucu listesine ekler/çıkartır'
    const reactions = ['⏯️', '⏭️', '⏏️', '🔁', '🔀', '🆑', '❤️', '🗒️']
    await mongo().then(async mongoose => {
      try {
        const result = await client.DBServer.find({})
        result.forEach(async (server) => {
          var channel = client.channels.cache.get(server.channel.id)
          if (channel) {
            // Kanalı güncelleme
            channel.setTopic(topicText)
            var mes = await channel.messages.fetch(server.channel.message.id)
            try {
              mes.reactions.removeAll()
            } catch (err) {
              console.log(err)
            }
            for (var i = 0; i < reactions.length; i++) {
              mes.react(reactions[i])
            }

            // Veritabanını güncelleme

            if (server.__v == 0) {
              const temp = {
                _id: server._id,
                channel: {
                  id: server.channelId,
                  message: {
                    id: server.messageId,
                    imageUrl: server?.imageUrl,
                    hexColor: server?.hexColor,
                    description: server?.description
                  }
                },
                settings: {
                  serverOut: server?.serverOut
                },
                __v: 1
              }
              await client.DBServer.findOneAndDelete({_id: server._id, __v: 0})
              await client.DBServer(temp).save()
            }

          } else {
            await client.DBServer.findOneAndDelete({ _id: server._id })
          }
        })


      } finally {
        mongoose.connection.close();
        message.reply('Komut çalıştı, logları kontrol et!')
      }
    })
  }
}
