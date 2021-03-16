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

async function embedEdit(isDefault, server, channel) {
  var embedMessagge = await channel.messages.fetch(server.messageId); // Özel kanal içerisindeki bilgi mesajını bulma
  const embed = new MessageEmbed();
  // NoMusic haline çevirme
  switch (isDefault) {
    case 'noMusic': // NoMusic haline çevirme
      embed.setTitle(config.embed.title)
      embed.setURL('http://devb.ga')
      embed.setImage(server.embedInfo.imageUrl)
      embed.setColor(server.embedInfo.hexColor)
      embed.setDescription(server.embedInfo.description)
      break;
    case 'playing': // Çalan şarkı bilgilerini gösterme
      var footerText = `Şuan ${server.queue.name[0]} çalıyor | Döngü ${server.queue.loop}`
      embed.setTitle(server.queue.name[0])
      embed.setURL(server.queue.url[0])
      embed.setImage(server.queue.thumbnail[0])
      embed.setColor(server.embedInfo.hexColor)
      embed.setFooter(footerText)
      embed.setDescription("Süre `" + server.queue.time[0] + "`" +` | İsteyen <@${server.queue.requester[0]}>`)
      if (server.queue.url[0]) {
        var sPoint = server.queue.name.length - 1;
        if (server.queue.name.length > 24) {
          sPoint = 25;
        }
        for (var i = sPoint; i >= 1; i--) {
          if (i === 25) {
            embed.addField(`Ve ${server.queue.url.length - 24} daha fazla video`, '...');
          }
          var t = server.queue.time[i]
          embed.addField(`${i} - ${server.queue.name[i]}`, "`" + t + "` " + `isteyen: <@${server.queue.requester[i]}>` );
          if (i === 1) {
            break;
          }
        }
      }
      break;
  }
  embedMessagge.edit(embed);
}
