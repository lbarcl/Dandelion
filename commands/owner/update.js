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
        const reactions = ['⏯️', '⏭️', '⏏️', '🔁', '🆑', '❤️', '🗒️', '#️⃣', '*️⃣']  
        await mongo().then(async mongoose => {
            try {
                const result = await serverScheme.find({})
                result.forEach(async (server) => {
                    client.channels.cache.get(server.channelId).setTopic(topicText)
                    var mes = await client.channels.cache.get(server.channelId).messages.fetch(server.messageId)
                    
                    mes.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                    reactions.forEach(r => {
                      mes.react(r)
                    })
                })
            
            } finally {
              mongoose.connection.close();
            }
        })
    }
}
