const lyricsFetcher = require('lyrics-parse')
const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'sözbul',
    aliases: ['sözbul', 'sb'],
    minArgs: 0,
    description: 'Çalmakta olan şarkının sözlerini bulur',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}sözbul` yazmanız yeterli",
    callback: async ({ message, client, args }) => {
        // Sunucu bilgileri alma
        const server = client.servers[message.guild.id]
            // Çalan şarkı olmadığından red
            if(!server.queue.url[0]) return message.reply('Şuan çalmakta olan şarkı olmadğından şarkı sözü görüntüleyemezsiniz')

        // Şarkıyı araştırmak
        console.log(server.queue.title[0])
        var args = server.queue.title[0]
        args = args.split('-')
        result = await lyricsFetcher(args[0], args[1])
            // Söz bulamadıysa red
            if(!result) return message.reply('Şarkı sözü bulunamadı')

        embed(result, message, client)
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