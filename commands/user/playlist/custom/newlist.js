const mongo = require('../../../../utils/database/mongo')

module.exports = {
  name: 'yeniçalmalistesi',
  aliases: ['yçl'],
  minArgs: 1,
  description: 'Yeni çalmalistesi oluşturur',
  expectedArgs: '[çalmalistesi-adı]',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}yeniçalmalistesi [çalmalistesi-adı]` yazmanız yeterli",
  callback: async ({ message, client, text }) => {
        await mongo().then(async mongoose => {
            try {
                var user = await client.DBUser.findById(message.author.id)
                if (!user) return message.reply('Sisteme kayıt olmadığınızdan dolayı bu işlemi gerçekleştiremiyorum')
                if (text.length > 100) return message.reply('Çalmalistesi adı 100 karakterden uzun olamaz')
                var title = text

                await client.DBPlaylist({
                    _id: message.id,
                    ownerId: message.author.id,
                    title
                }).save()

                message.reply(`\`${title}\` çalmalistesi oluşturuldu \`ID ${message.id}\``)
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz çalma listesi oluştururken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })
    }
}