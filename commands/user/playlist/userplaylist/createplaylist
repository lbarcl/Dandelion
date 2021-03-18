const mongo = require('../../../../utils/database/mongo')
const {getReply} = require('../../../../utils/messageWorks')
const {MessageEmbed} = require('discord.js')

module.exports = {
  name: 'çalmalistesioluştur',
  aliases: ['çalmalistesioluştur', 'ço'],
  minArgs: 0,
  description: 'Kullanıcının beğenilen şarkılarını görüntüler',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}beğenilenler` yazmanız yeterli",
  callback: async ({ message, client }) => {
        await mongo().then(async mongoose => {
            try{
                const user = await client.DBUser.findById(message.author.id)
                if(!user) return message.reply('Sisteme kayıtlı değilsiniz, kayıt olmak için ise `-kayıt` yazmanız yeterli')

                message.reply('çalma listesi adını girin, eğer iptal etmek iseterseniz `iptal` yazmanız yeterli')
                let title = await getReply(message, {time: 60000})
                if (!title) return message.reply('bir dakikalık süren doldu, işlemin iptal ediliyor')
                else if (title.content.length > 75) return message.reply('75 karakterden fazla karakter kullanamazsın')
                if(title.content.toLowerCase() == 'iptal') return message.reply('iptal edildi')

                message.reply('çalma listesi açıklaması girin, eğer iptal etmek iseterseniz `iptal` yazmanız yeterli')
                let description = await getReply(message, {time: 120000})
                if (!description) return message.reply('iki dakikalık süren doldu, işlemin iptal ediliyor')
                else if (description.content.length > 2048) return message.reply('2048 karakterden fazla karakter kullanamazsın')
                if(description.content.toLowerCase() == 'iptal') return message.reply('iptal edildi')

                message.reply('çalma listesi resmini girin, eğer eklemek istemiyorsanız `boş` yazmanız yeterli')
                let image = await getReply(message, { time: 120000, type: 'image' });
                
                if (image.attachments){
                  image.attachments.forEach(i => {
                    image = i.url
                  })
                }
                else if (image.content.toLowerCase() != 'boş') image = 'boş'
                else if (!image) image = 'boş'
                
                await client.DBPlaylist({
                    _id: message.id,
                    ownerId: message.author.id,
                    title,
                    description,
                    image,
                    color: client.config.embed.color
                }).save()

                const embed = new MessageEmbed()
                .setTitle(title)
                .setDescription(description)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setFooter(`Çalmalistesi: ${message.id} | Oluşturan: ${message.author.username}`)
                .setColor(client.config.embed.color)
                if(image != 'boş') embed.setImage(image)

                message.channel.send(embed)

            }finally {
                mongoose.connection.close()
            }
        })
    }
}