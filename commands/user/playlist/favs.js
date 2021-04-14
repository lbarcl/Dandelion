const {mongoFind} = require('../../../utils/database/infoGet')
const mongo = require('../../../utils/database/mongo')
const {MessageEmbed} = require('discord.js')

module.exports = {
  name: 'beğenilenler',
  aliases: ['beğenilenler', 'b'],
  minArgs: 0,
  description: 'Kullanıcının beğenilen şarkılarını görüntüler',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}beğenilenler` yazmanız yeterli",
  callback: async ({ message, client }) => {
        var list = []
        await mongo().then(async mongoose => {
            try {
                console.log(`[${message.author.id}] Beğenilenleri almak için veritabanına bağlanıyor`)
                const result = await client.DBUser.findById(message.author.id)
                if(!result) return message.reply('Beğenilenleri görüntülemek için sisteme kayıt olmanız gerekmektedir, kayıt olmak için `{PREFIX}kayıt` yazmanız yeterli')
                if(!result.favoriteSongs[0]) return message.reply('Beğenilenleriniz boş gözüküyor, şarkı beğenmek için Radio şarkı çalarken Radionun mesajının altındaki `❤️` ikona basmanız yeterli')
                list = result.favoriteSongs
              } finally {
                console.log(`[${message.author.id}] Veritabanı bağlantısı kesiliyor`)
                mongoose.connection.close()
            }
            
            embed(list, message, 1, client)
        })
    }
}

async function embed(list, message, index, client) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.avatarURL())
      .setTitle(`${message.author.username} tarafından beğenilenler`)
      .setColor(client.config.embed.color)
    for (var x = 0; x < list.length; x++) {
      var vdet = await mongoFind(list[x])
      embed.addField(`${index} - ${vdet.title}`, list[x])

      index++;
      if (x == 25) {
        for (var y = 0; y < 25; y++) {
          list.shift();
        }
        message.channel.send(embed)
        embed(list, message, index, client)
      }
    }
    message.channel.send(embed)
  }
