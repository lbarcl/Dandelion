const {MessageEmbed} = require('discord.js')
const axios = require('axios')

module.exports = {
    name: 'sözbul',
    aliases: ['sözbul', 'sb'],
    minArgs: 0,
    description: 'Çalmakta olan şarkının sözlerini bulur',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}sözbul` yazmanız yeterli",
    callback: async ({ message, client }) => {
      // Sunucu bilgileri alma
      const server = client.servers[message.guild.id]
          // Çalan şarkı olmadığından red
          if(!server.queue.url[0]) return message.reply('Şuan çalmakta olan şarkı olmadğından şarkı sözü görüntüleyemezsiniz')

      // Şarkıyı araştırmak
      var url = server.queue.title[0].toLowerCase().replace(' ', '+')
      url = encodeURI(`https://lyric--api.herokuapp.com/lyric/${url}+şarkı+sözü`)
      var result = await axios.get(url)
      if (result.status != 200) return message.reply('Özür dileriz söz bulamadık')
      embed(result.data.lyric, message, client)
    }
}

function embed(lyrics, message, client){
  const server = client.servers[message.guild.id]
  var mLyrics
  if (lyrics.length / 2048 > 1){
    mLyrics = lyrics.slice(2048)
    lyrics = lyrics.slice(0, 2048)
  } 

  if (mLyrics) embed(mLyrics, message, client)
  // Embed oluşturma
  const x = new MessageEmbed()
  .setAuthor(message.author.username,message.author.avatarURL())
  .setTitle(server.queue.title[0])
  .setThumbnail(server.queue.image[0])
  .setDescription(lyrics)
  .setColor(client.config.embed.color)
  message.channel.send(x)
}