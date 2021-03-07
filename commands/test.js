const command = require('../utils/command');
const mongo = require('../utils/mongo');
const serverScheme = require('../schemes/server-scheme');

module.exports = (client) => {
  command(client, 'test', async (message, args, text) =>{
    const guilds = client.guilds
    await mongo().then(async mongoose => {
      try {
        guilds.cache.forEach(async (guild) => {
          const result = await serverScheme.findOne({ _id: guild.id });
          console.log(`Veritabına güncelleme bilgisi almak için bağlanıyor [${guild.id}]`);
          if(result != null){

            const channel = guild.channels.cache.get(result.channelId)
            const mes = await channel.messages.fetch(result.messageId)
            channel.setTopic("[⏭️] Sonraki şarkı | [⏏️] Kanaldan ayrıl | [🔁] Sırayı döngüye al/çıkar | [🆑] Sırayı temizle | [❤️] Çalan şarkıyı beğen/beğenme | [🗒️] Çalan şarkıyı sunucu listesine ekler/çıkartır | [#️⃣] Beğenilen şarkıları sıraya ekler | [*️⃣] Sunucu şarkı listesini sıraya ekler")

          }
        })
      } finally {
        console.log(`Bağlantı kapanıyor [${guild.id}]`);
        mongoose.connection.close();
      }
    })
  })
}
