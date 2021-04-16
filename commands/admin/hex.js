const mongo = require('../../utils/database/mongo')
const {embedEdit} = require('../../utils/API/messageWorks')

module.exports = {
  minArgs: 0,
  maxArgs: 1,
  name: 'renkdeğiş',
  guildOnly: true,
  aliases: ['renkdeğiş', 'rkd'],
  permissions: ['MANAGE_GUILD'],
  description: 'Radio mesaj rengini değiştirir',
  expectedArgs: '[renk-kodu]',
  syntaxError: "Yanlış kullanım, `{PREFIX}renkdeğiş [renk-kodu]`",
  callback: async ({ message, client, args }) => {
    const { guild } = message
    if (!args[0].startsWith('#')) return message.reply('Lütfen doğru bir hex kodu girdiğinizden emin olun')
  
    await mongo().then(async mongoose => {
        try{
            console.log(`<${guild.id}> Sunucu embed rengi değişmek için veritabanına bağlanıyor`)
            await client.DBServer.findByIdAndUpdate(guild.id, {$set: {hexColor: text}})
            client.servers[guild.id].embedInfo.hexColor = args[0]
            if (client.servers[guild.id].queue.url[0]) embedEdit('playing', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
            else if (!client.servers[guild.id].queue.url[0]) embedEdit('noMusic', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
            message.reply('Renk başarılı bir şekilde değişti')
        }finally{
            console.log(`<${guild.id}> Sunucu veritabanı bağlantası kapanıyor`)
            mongoose.connection.close()
        }
    })
  }
}
