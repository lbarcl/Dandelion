const mongo = require('../../utils/database/mongo')

module.exports = {
  name: 'güncelle',
  aliases: ['güncelle', 'gl'],
  ownerOnly: true,
  minArgs: 0,
  description: 'Sadece bot sahibi tarafından kullanılabilen bot kanalı ve bot mesajını güncellemek için kullanılan komut',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}kurulum` yazmanız yeterli",
  callback: async ({ message, client }) => {
        const topicText = '[⏯️] Durdur/Devam | [⏭️] Sonraki şarkı | [⏏️] Kanaldan ayrıl | [🔁] Sırayı döngüye al/çıkar | [🆑] Sırayı temizle | [❤️] Çalan şarkıyı beğen/beğenme | [🗒️] Çalan şarkıyı sunucu listesine ekler/çıkartır | [#️⃣] Beğenilen şarkıları sıraya ekler |  [*️⃣] Sunucu şarkı listesini sıraya ekler'
        const reactions = ['⏯️', '⏭️', '⏏️', '🔁', '🔀', '🆑', '❤️', '🗒️', '#️⃣', '*️⃣']  
        await mongo().then(async mongoose => {
            try {
              const result = await client.DBServer.find({})
              result.forEach(async (server) => {
                var channel = client.channels.cache.get(server.channelId)
                if(channel){
                  channel.setTopic(topicText)
                  var name = channel.name
                  if(name.includes('radio')) name.replace('radio', client.user.username)
                  var mes = await channel.messages.fetch(server.messageId)
                  try {
                    mes.reactions.removeAll()
                  } catch (err){
                    console.log(err)
                  }
                  for(var i = 0; i < reactions.length; i++){
                    mes.react(reactions[i])
                  }
                } else {
                  await client.DBServer.findOneAndDelete({_id: server._id})
                }
              })
            } finally {
              mongoose.connection.close();
            }
        })
    }
}
