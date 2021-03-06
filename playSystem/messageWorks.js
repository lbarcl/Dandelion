const { MessageEmbed } = require('discord.js')
const config = require('../config')

module.exports = {
  deleteAfterSend,
  embedEdit
}

async function deleteAfterSend(text, messageDeleteTime, message){
  var m = await message.channel.send(text);
  setTimeout(function() { m.delete(); }, messageDeleteTime);
}

async function embedEdit(isDefault, perServer, channel) {
  var embedMessagge = await channel.messages.fetch(perServer.messageId); // Özel kanal içerisindeki bilgi mesajını bulma
  const embed = new MessageEmbed();
  // NoMusic haline çevirme
  switch (isDefault) {
    case 'noMusic': // NoMusic haline çevirme
      embed.setTitle(config.noMusicTitle)
      embed.setURL('http://devb.ga')
      embed.setImage(config.noMusic)
      embed.setColor(config.embedColor)
      embed.setDescription('Şuan çalmakta olan hiç bir müzik yok')
      break;
    case 'playing': // Çalan şarkı bilgilerini gösterme
      var footerText = `Şuan ${perServer.name[0]} çalıyor | Süre ${perServer.time[0]} | Döngü ${perServer.ıslooping}`
      embed.setTitle(perServer.name[0])
      embed.setURL(perServer.list[0])
      embed.setImage(perServer.thumbnail[0])
      embed.setColor(config.embedColor)
      embed.setFooter(footerText)
      if (perServer.list[0]) {
        var sPoint = perServer.name.length - 1;
        if (perServer.name.length > 24) {
          sPoint = 25;
        }
        for (var i = sPoint; i >= 1; i--) {
          if (i === 25) {
            embed.addField(`Ve ${perServer.list.length - 24} daha fazla video`, '...');
          }
          var t = perServer.time[i]
          embed.addField(`${i} - ${perServer.name[i]}`, "`" + t + "`");
          if (i === 1) {
            break;
          }
        }
      }
      break;
  }
  embedMessagge.edit(embed);
}
