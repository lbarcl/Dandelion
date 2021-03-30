const music = require('musicmatch')({apikey:"5e079c22e00ebeb72aae84020166f46c"});
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
        var args = server.queue.title[0]
        var result = await music.trackSearch({q: args})
        var tracks = result.message.body.track_list

        var t = {title: [], id: []}
        for (var i = 0; i < tracks.length; i++){
          t.title.push(`${tracks[i].track.track_name} - ${tracks[i].track.artist_name}`)
          t.id.push(tracks[i].track.track_id)
        }

        result = search(args, t.title)
        var index = t.title.indexOf(result[0])
        result = await music.trackLyrics({track_id:t.id[index]})  
        console.log(result.message.body.lyrics)
        /*
            // Söz bulamadıysa red
            if(!result) return message.reply('Şarkı sözü bulunamadı')

        embed(result, message, client)
        */
    }
}

function search(keyWord, list){
  var flag = 0
  const max = keyWord.length
  var searched = []
  for(var l = 0; l < list.length; l++){
      for(var m = 0; m < max; m++){
          flag = 0
          if(list[l].toLowerCase()[m] != keyWord.toLowerCase()[m]){
              flag = 1
              break
          }
      }
      if(flag == 0){
          searched.push(list[l])
      }
  }

  if(!searched[0]){
    var args = keyWord.split(' - ')
    var temp = args[0]
    args[0] = args[1]
    args[1] = temp
    keyWord = args.join(' - ')
    searched = search(keyWord, list)
  }

  return searched
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