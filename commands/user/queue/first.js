const {embedEdit} = require('../../../utils/API/messageWorks')
const {play} = require('../../../utils/Video&Song/ytdlThings')
const {mongoCheck, mongoFind}  = require('../../../utils/database/infoGet')
const {calculateTime} = require('../../../utils/Video&Song/ytdlThings')
const ytdl = require('ytdl-core')

module.exports = {
    name: 'ilkçal',
    aliases: ['ilkçal', 'iç'],
    minArgs: 1,
    guildOnly: true,
    expectedArgs: '[video-anahtar-kelime / video-linki]',
    description: 'Çalma listesine girilen şarkıyı ilk sıraya alıp çalmaya başlar',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}ilkçal [video-anahtar-kelime / video-linki]` ",
    callback: async ({ message, client}) => {
        var server = client.servers[message.guild.id]
        var result
        if(ytdl.validateURL(message.content)){
          result = await mongoFind(message.content)
          server.queue.url.push(result.url)            
          server.queue.title.push(result.title)  
          server.queue.time.push(calculateTime(result.time)) 
          server.queue.image.push(result.image)  
          server.queue.requester.push(message.author.id)  
        } else {
          result = await mongoCheck(message.content)
          result = await mongoFind(result)
          server.queue.url.push(result.url)            
          server.queue.title.push(result.title)  
          server.queue.time.push(calculateTime(result.time))  
          server.queue.image.push(result.image)  
          server.queue.requester.push(message.author.id)  
        }
        embedEdit('playing', server, client.channels.cache.get(server.channelId));
        message.reply(`${server.queue.title[0]} Şimdi oynatılıyor`)
        if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
            play(server, connection, client.channels.cache.get(server.channelId));
        })
        client.servers[message.guild.id] = server
    }
}