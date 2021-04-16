const {play} = require('../../utils/Video&Song/ytdlThings')
const {deleteAfterSend, embedEdit} = require('../../utils/API/messageWorks')
const setup = require('../../utils/setup')

module.exports = (client) => {
    const messageDeleteTime = 10000

    client.on('messageReactionAdd', async (reaction, user) => {
        if (reaction.partial) {
          try {
            await reaction.fetch();
          } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            return;
          }
        }
    
        if(user.bot) return
        var server = await setup(client.servers, reaction.message.guild) // cache guild kayıdı ve veritabanı bağlantısı
        if(server == null) return
    
        if (reaction.message.id != server.messageId) return
        const member = reaction.message.guild.members.cache.get(user.id)
        reaction.users.remove(user)
        
        if (server.dispatcher){
          if (member.voice.channelID != server.dispatcher.player.voiceConnection.channel.id) { // kullanıcının ses kanalında olup olmadığı kontrolü
            deleteAfterSend('Kullanabilmek için aynı ses kanalında olman gerekli', messageDeleteTime, message) // belirli süre sonra silinen uyarı mesajı
            return
          }
        } else if (!member.voice.channelID) return deleteAfterSend('Kullanabilmek için ses kanalında olman gerekli', messageDeleteTime, message)        
        
        switch (reaction.emoji.name){
          case '⏯️':
          if(!server.dispatcher) return
          if(server.dispatcher.pausedSince == null){
            server.dispatcher.pause()
            deleteAfterSend('Durduruluyor', messageDeleteTime, reaction.message)
            embedEdit('paused', server, reaction.message.channel);
          }
          else if (server.dispatcher.pausedSince != null){
            server.dispatcher.resume()
            deleteAfterSend('Devam ediliyor', messageDeleteTime, reaction.message)
            embedEdit('playing', server, reaction.message.channel);
          }
          break
          case '⏭️':
          server.queue.url.shift()
          server.queue.title.shift()
          server.queue.time.shift()
          server.queue.image.shift()
          server.queue.requester.shift()
          if(!server.queue.url[0]){
            embedEdit('noMusic', server, reaction.message.channel)
            server.dispatcher.player.voiceConnection.disconnect();
            server.dispatcher = null
            return
          }
          embedEdit('playing', server, reaction.message.channel);
          member.voice.channel.join().then(function(connection) {
            play(server, connection, reaction.message.channel);
          })
          
          break
          case '⏏️':
          if (server.queue.url[0]) {
            for (var i = server.queue.url.length; i > 0; i--) {
              server.queue.url.pop();
              server.queue.title.pop();
              server.queue.time.pop();
              server.queue.image.pop();
              server.queue.requester.pop();
            }
          }
          deleteAfterSend('Kanaldan ayrılıyor', messageDeleteTime, reaction.message);
          server.dispatcher.player.voiceConnection.disconnect();
          server.dispatcher = null
          embedEdit('noMusic', server, reaction.message.channel);
          break
          case '🔀':
          if (!server.queue.url[0]) return deleteAfterSend('Liste karıştırabileceğim hiç bir şey yok', messageDeleteTime, reaction.message)
          var queue = server.queue
          var currentIndex = queue.url.length

          while(0 !== currentIndex){
            var randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1

            var temp = {url: queue.url[currentIndex], title: queue.title[currentIndex], time: queue.time[currentIndex], image: queue.image[currentIndex], requester: queue.requester[currentIndex]}
            queue.url[currentIndex] = queue.url[randomIndex]
            queue.title[currentIndex] = queue.title[randomIndex]
            queue.time[currentIndex] = queue.time[randomIndex]
            queue.image[currentIndex] = queue.image[randomIndex]
            queue.requester[currentIndex] = queue.requester[randomIndex]

            queue.url[randomIndex] = temp.url
            queue.title[randomIndex] = temp.title
            queue.time[randomIndex] = temp.time
            queue.image[randomIndex] = temp.image
            queue.requester[randomIndex] = temp.requester
          }

          server.queue = queue
          embedEdit('playing', server, reaction.message.channel);
          member.voice.channel.join().then(function(connection) {
            play(server, connection, reaction.message.channel);
          })
          break
          case '🔁':
            if (server.queue.url[0]) {
      
              if (server.queue.loop === 'açık') {
                server.queue.loop = 'kapalı';
                deleteAfterSend('Döngüden çıktı', messageDeleteTime, reaction.message);
              }
              else {
                server.queue.loop = 'açık';
                deleteAfterSend('Şarkı döngüye açıldı', messageDeleteTime, reaction.message);
              }
              embedEdit('playing', server, reaction.message.channel);
            }
            break
          case '🆑':
          if (server.queue.url[1]) {
            for (var i = server.queue.url.length; i > 0; i--) {
              if (!server.queue.url[1]) {
                break;
              }
              server.queue.url.pop();
              server.queue.title.pop();
              server.queue.time.pop();
              server.queue.image.pop();
              server.queue.requester.pop()
            }
            deleteAfterSend('Sıra temizlendi', messageDeleteTime, reaction.message);
            if (!server.queue.url[0]) {
              embedEdit('noMusic', server, reaction.message.channel);
            }
            else {
              embedEdit('playing', server, reaction.message.channel);
            }
            return
          }
          deleteAfterSend('Sırada içerik yok', messageDeleteTime, reaction.message);
          break
       /* case '❤️':
          favThing(server, reaction.message, messageDeleteTime, user)
        break
        case '🗒️':
          listThing(server, reaction.message, messageDeleteTime, reaction.message.guild, member)
        break
        case '#️⃣':
          var x = false;
          if (server.queue.url[0]) x = true
          server = await place(server, user, messageDeleteTime, reaction.message)
          if(!server.queue.url[0]) return
          if (!x) {
            embedEdit('playing', server, reaction.message.channel);
            if (!reaction.message.guild.voiceConnection) member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
              play(server, connection, reaction.message.channel);
            })
          }
          embedEdit('playing', server, reaction.message.channel);
        break
        case '*️⃣':
          var x = false;
          if (server.queue.url[0]) x = true
          server = await pasteList(server, reaction.message, messageDeleteTime, user)
          if(!server.queue.url[0]) return
          if (!x) {
            embedEdit('playing', server, reaction.message.channel);
            if (!reaction.message.guild.voiceConnection) member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
              play(server, connection, reaction.message.channel);
            })
          }
          embedEdit('playing', server, reaction.message.channel);
        break */
      }
  })
}