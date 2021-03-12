const command = require('../utils/command');
const mongo = require('../utils/mongo');
const serverScheme = require('../schemes/server-scheme');

module.exports = (client) =>{
  command(client, 'update', async (message) => {
    await mongo().then(async mongoose => {
      try {
        const result = await serverScheme.find({})
        console.log(result)
        result.forEach(async (server) => {
          client.channels.cache.get(server.channelId).setTopic("[⏯️] Durdur/Devam | [⏭️] Sonraki şarkı | [⏏️] Kanaldan ayrıl | [🔁] Sırayı döngüye al/çıkar | [🆑] Sırayı temizle | [❤️] Çalan şarkıyı beğen/beğenme | [🗒️] Çalan şarkıyı sunucu listesine ekler/çıkartır | [#️⃣] Beğenilen şarkıları sıraya ekler | [*️⃣] Sunucu şarkı listesini sıraya ekler")
          var mes = await client.channels.cache.get(server.channelId).messages.fetch(server.messageId)

          mes.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
          mes.react('⏯️');
          mes.react('⏭️');
          mes.react('⏏️');
          mes.react('🔁');
          mes.react('🆑');
          mes.react('❤️');
          mes.react('🗒️');
          mes.react('#️⃣');
          mes.react('*️⃣'); 
        })

      } finally {
        console.log(`Bağlantı kapanıyor [${message.guild.id}]`);
        mongoose.connection.close();
      }
    })
  })
}
