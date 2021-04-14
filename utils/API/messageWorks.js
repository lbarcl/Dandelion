const { MessageEmbed } = require('discord.js')
const config = require('../../config')

module.exports = {
  deleteAfterSend,
  embedEdit,
  getReply
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
      var footerText = `Şuan ${server.queue.title[0]} çalıyor | Döngü ${server.queue.loop}`
      embed.setTitle(server.queue.title[0])
      embed.setURL(server.queue.url[0])
      embed.setImage(server.queue.image[0])
      embed.setColor(server.embedInfo.hexColor)
      embed.setFooter(footerText)
      embed.setDescription("Süre `" + server.queue.time[0] + "`" +` | İsteyen <@${server.queue.requester[0]}>`)
      if (server.queue.url[0]) {
        var sPoint = server.queue.title.length;
        if (server.queue.title.length > 24) sPoint = 24;
        for (var i = sPoint; i >= 0; i--) {
          if (i === 24) embed.addField(`Ve ${server.queue.url.length - 23} daha fazla video`, '...');
          if (!server.queue.url[i]) continue
          var t = server.queue.time[i]
          embed.addField(`${i} - ${server.queue.title[i]}`, "`" + t + "` " + `isteyen: <@${server.queue.requester[i]}>` );
        }
      }
      break;
  }
  embedMessagge.edit(embed);
}

async function getReply(message, options) {
  let time = 30000
  let user = message.author
  let words = []
  if (options) {
      if (options.time) time = options.time
      if (options.user) user = options.user
      if (options.words) words = options.words
  }
  const filter = msg => {
      return msg.author.id === user.id && (words.length === 0 || words.includes(msg.content.toLowerCase()))
  }
  const msgs = await message.channel.awaitMessages(filter, { max: 1, time: time })
  if (msgs.size > 0) return msgs.first()
  return false
}
