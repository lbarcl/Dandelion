const mongo = require('../../utils/mongo')
const {embedEdit} = require('../../utils/messageWorks')

module.exports = {
  minArgs: 1,
  name: 'açıklamadeğiş',
  guildOnly: true,
  aliases: ['açıklamadeğiş', 'ad'],
  permissions: ['MANAGE_GUILD'],
  description: 'Radio mesaj açıklamasını değiştiri',
  expectedArgs: '[açıklama]',
  syntaxError: "Yanlış kullanım, `{PREFIX}açıklamadeğiş [açıklama]`",
  callback: async ({ message, client, text }) => {
    const { guild } = message
  
    await mongo().then(async mongoose => {
        try{
            console.log(`<${guild.id}> Sunucu açıklama değişmek için veritabanına bağlanıyor`)
            await client.DBServer.findByIdAndUpdate(guild.id, {
              description: text
            })
            client.servers[guild.id].embedInfo.description = text
            if (client.servers[guild.id].queue.url[0]) embedEdit('playing', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
            else if (!client.servers[guild.id].queue.url[0]) embedEdit('noMusic', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
            message.reply('Açıklama başarılı bir şekilde değişti')
        }finally{
            console.log(`<${guild.id}> Sunucu veritabanı bağlantası kapanıyor`)
            mongoose.connection.close()
        }
    })
  }
}
