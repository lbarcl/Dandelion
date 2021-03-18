const mongo = require('../../../utils/database/mongo')

module.exports = {
  name: 'kayıt',
  aliases: ['kayıt', 'kt'],
  minArgs: 0,
  description: 'Kullanıcıyı sisteme kayıt eder',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}kayıt` yazmanız yeterli",
  callback: async ({ message, client }) => {
    await mongo().then(async mongoose => {
        const { author } = message
        try{
            console.log(`<${author.id}> Sisteme kayıt olmak için veritabanına bağlanıyor`)
            const result = await client.DBUser.findById(author.id)
            if(result) return message.reply('Daha önceden kayıt olduğunuz için tekrar kayıt olamazsınız')  
            await new client.DBUser({
                _id: author.id,
                discordTag: author.tag,
                discordAvatar: author.avatarURL()
            }).save()
            message.reply('Sisteme başarlı bir şekilde kayıt oldunuz, aramıza hoşgeldin ' + author.username)  
        } 
        finally {
            console.log(`<${author.id}> Veritabanı bağlantısı kesiliyor`)
            mongoose.connection.close()
        }
    })
  }
}
