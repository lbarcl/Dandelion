const mongo = require('../../utils/mongo')
const {embedEdit} = require('../../utils/messageWorks')

module.exports = {
  name: 'resimdeğiş',
  aliases: ['resimdeğiş', 'rd'],
  guildOnly: true,
  //permissions: ['MANAGE_GUILD'],
  minArgs: 0,
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}kurulum` yazmanız yeterli",
  callback: async ({ message, client, text }) => {
    var image
    const { guild } = message
    if(!text){
        message.attachments.forEach(Image => {
            if (!image) image = Image.url
        }); 
    }
    else {
        if(!text.includes('://cdn.discordapp.com/attachments/')) return message.reply('Bir discord resim linki veya resmin kendisni atmanız gerekmektedir')
        image = text
    }
    if (!image) return message.reply('Üzgünüm girdiğiniz linkten veya gönderdiğiniz resimden bir şeye ulaşamadık')
    await mongo().then(async mongoose => {
        try{
            console.log(`<${guild.id}> Sunucu embed resmi değişmek için veritabanına bağlanıyor`)
            await client.DBServer.findByIdAndUpdate(guild.id, {
              embedImageUrl: image  
            })
            client.servers[guild.id].embedImageUrl = image
            if (client.servers[guild.id].queue.url[0]) embedEdit('playing', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
            else if (!client.servers[guild.id].queue.url[0]) embedEdit('noMusic', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
            message.reply('Resim başarılı bir şekilde değişti')
        }finally{
            console.log(`<${guild.id}> Sunucu veritabanı bağlantası kapanıyor`)
            mongoose.connection.close()
        }
    })
  }
}
