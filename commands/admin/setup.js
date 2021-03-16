const mongo = require('../../utils/mongo')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'kurulum',
  aliases: ['kurulum', 'kr'],
  guildOnly: true,
  permissions: ['MANAGE_GUILD'],
  minArgs: 0,
  description: 'Sunucuda radio kurulumu yapar, her sunucu için bir kere kullanılabilir',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}kurulum` yazmanız yeterli",
  callback: async ({ message, client }) => {
    await mongo().then(async mongoose => {
      const {guild} = message
      try{
        console.log(`<${guild.id}> Sunucu kurulumu için veritabanına bağlanıyor`)
        
        // Database kontorlü
        const result = await client.DBServer.findById(guild.id)
        if(result) return message.reply('Kurulum daha önceden yapıldığından dolayı tekrar kurulum gerçekleştiremezsiniz')

        // Radio kanalı oluşturma
        const newChannel = await guild.channels.create(client.user.username, { type: 'text' });
        newChannel.setTopic("[⏯️] Durdur/Devam | [⏭️] Sonraki şarkı | [⏏️] Kanaldan ayrıl | [🔁] Sırayı döngüye al/çıkar | [🆑] Sırayı temizle | [❤️] Çalan şarkıyı beğen/beğenme | [🗒️] Çalan şarkıyı sunucu listesine ekler/çıkartır | [#️⃣] Beğenilen şarkıları sıraya ekler | [*️⃣] Sunucu şarkı listesini sıraya ekler")
         
         // Embed hazırlama
         const embed = new MessageEmbed()
         .setTitle(client.config.embed.title)
         .setURL('http://devb.ga')
         .setImage(client.config.embed.image)
         .setColor(client.config.embed.color)
         .setDescription(client.config.embed.description)

          // Embed mesajı oluşturulan kanala gönderme
          const newMessage = await newChannel.send(embed)

            // Gönderilen mesaja reaksiyon ekelme
            newMessage.react('⏯️');
            newMessage.react('⏭️');
            newMessage.react('⏏️');
            newMessage.react('🔁');
            newMessage.react('🆑');
            newMessage.react('❤️');
            newMessage.react('🗒️');
            newMessage.react('#️⃣');
            newMessage.react('*️⃣');

        // Oluşturulan kanal ve gönderilen mesaj bilgisini veri tabanına kaydetme
        await new client.DBServer({
          _id: guild.id,
          channelId: newChannel.id,
          messageId: newMessage.id
        }).save()
        message.reply("Sunucu kurulumu tamamlandı")
      } catch (err) {
        message.reply(`Üzgünüm bir hatadan dolayı işlemi gerçekleştiremiyorum. Hata:\n ${err} \n ` + "`{PREFIX}destek` komudunu kullanarak yardım isteğinde bulunabilirsiniz")
      } finally{
        console.log(`<${guild.id}> Veritabanı bağlantısı kesiliyor`)
        mongoose.connection.close()
      }
    })
  }
}
