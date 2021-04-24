const mongo = require('../../../../utils/database/connect')

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
                if (text.length > 100) return message.reply('Çalmalistesi adı 100 karakterden uzun olamaz')
                var title = text

                await client.DBPlaylist({
                    _id: message.id,
                    info: {
                        owner: message.author.id,
                        title,
                        type: 'custom'
                    }
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