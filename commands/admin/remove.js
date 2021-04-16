const mongo = require('../../utils/database/mongo')

module.exports = {
  minArgs: 0,
  name: 'ayrılantemizle',
  guildOnly: true,
  aliases: ['ayrılantemizle', 'at'],
  permissions: ['MANAGE_GUILD'],
  description: 'Aktif edildiğinde şarkı ekleyen kişi kanaldan çıktığında eklediği şarkılar kaldırılır',
  syntaxError: "Yanlış kullanım, `{PREFIX}ayrılantemizle`",
  callback: async ({ message, client }) => {
    const { guild } = message
  
    await mongo().then(async mongoose => {
        try{
            console.log(`[${guild.id}] Sunucu ayarı değiştirmek için bağlanıyor`)
            var server = await client.DBServer.findById(guild.id)
            if (server.settings.serverOut == 'açık'){
                await client.DBServer.findByIdAndUpdate(guild.id, {$set: {serverOut: 'kapalı'}})
                server.serverOut = 'kapalı'
            } 
            else{
                await client.DBServer.findByIdAndUpdate(guild.id, {$set: {serverOut: 'açık'}})
                server.serverOut = 'açık'
            }
            message.reply(`Kişi çıkınca şarkı kaldırma \`${server.serverOut}\` olarak ayarlandı`)
        }finally{
            console.log(`[${guild.id}] Sunucu veritabanı bağlantası kapanıyor`)
            mongoose.connection.close()
        }
    })
  }
}