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

            mes.react('⏭️');
            mes.react('⏏️');
            mes.react('🔁');
            mes.react('🆑');
            mes.react('❤️');
            mes.react('🗒️');
            mes.react('#️⃣');
            mes.react('*️⃣'); 
          }
        })
      } finally {
        console.log(`Bağlantı kapanıyor [${guild.id}]`);
        mongoose.connection.close();
      }
    })
  })
}
