const mongo = require('../../../utils/mongo')
const {MessageEmbed} = require('discord.js')
const ytdl = require('ytdl-core')

module.exports = {
  name: 'sunuculistesi',
  aliases: ['sunuculistesi', 'sl'],
  minArgs: 0,
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}sunuculistesi` yazmanız yeterli",
  guildOnly: true,
  callback: async ({ message, client }) => {
        var list = []
        await mongo().then(async mongoose => {
            const {guild} = message
            try {
                console.log(`<${guild.id}> Sunucu listesini almak için veritabanına bağlanıyor`)
                const result = await client.DBServer.findById(guild.id)
                if(!result) return message.reply('Radio sunucunuzda kurulu değil, bu sebep ile sunucu listesi yok. Kurulum için `{PREFIX}kurulum` yazmanız yeterli')
                if(!result.serverList[0]) return message.reply('Sunucu listeniz boş gözüküyor, listeye şarkı eklemek için Radio şarkı çalarken Radionun mesajının altındaki `🗒️` ikona basmanız yeterli')
                list = result.serverList
              } finally {
                console.log(`<${guild.id}> Veritabanı bağlantısı kesiliyor`)
                mongoose.connection.close()
            }
            embed(list, message, 1, client)
        })
    }
}

async function embed(list, message, index, client) {
    const { guild } = message
    const embed = new MessageEmbed()
      .setAuthor(guild.name, guild.iconURL())
      .setTitle(`${guild.name} şarkı listesi`)
      .setColor(client.config.embed.color)
    for (var x = 0; x < list.length; x++) {
      if (ytdl.validateURL(list[x])) {
  
        var vdet = await ytdl.getBasicInfo(list[x])
        vdet = vdet.player_response.videoDetails;
        var name = `${index} - ${vdet.title}`;
        embed.addField(name, list[x])
  
        index++;
        if (x == 25) {
          for (var y = 0; y < 25; y++) {
            list.shift();
          }
          message.channel.send(embed)
          embed(list, message, index, client)
        }
      }
    }
    message.channel.send(embed)
  }
