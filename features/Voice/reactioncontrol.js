const {listThing, favThing} = require('../../utils/Playlist/favThing')
const {pasteList, place} = require('../../utils/Playlist/listImport')
const {play} = require('../../utils/Video&Song/ytdlThings')
const {deleteAfterSend, embedEdit} = require('../../utils/messageWorks')
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
        if (!member.voice.channelID) { // kullanıcının ses kanalında olup olmadığı kontrolü
          deleteAfterSend('Kullanabilmek için ses kanalında olman gerekli', messageDeleteTime, reaction.message) // belirli süre sonra silinen uyarı mesajı
          return
        }
        switch (reaction.emoji.name){
          case '⏯️':
          if(!server.dispatcher) return
          if(server.dispatcher.pausedSince == null){
            server.dispatcher.pause()
            deleteAfterSend('Durduruluyor', messageDeleteTime, reaction.message)
          }
          else if (server.dispatcher.pausedSince != null){
            server.dispatcher.resume()
            deleteAfterSend('Devam ediliyor', messageDeleteTime, reaction.message)
          }
          break
          case '⏭️':
          server.queue.url.shift()
          server.queue.name.shift()
          server.queue.time.shift()
          server.queue.thumbnail.shift()
          server.queue.requester.shift()
          if(!server.queue.url[0]){
            embedEdit('noMusic', server, reaction.message.channel)
            member.voice.channel.leave()
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
              server.queue.name.pop();
              server.queue.time.pop();
              server.queue.thumbnail.pop();
              server.queue.requester.pop();
            }
          }
          deleteAfterSend('Kanaldan ayrılıyor', messageDeleteTime, reaction.message);
          member.voice.channel.leave();
          embedEdit('noMusic', server, reaction.message.channel);
    
          break
          case '🔁':
          if (server.queue.url[0]) {
    
            if (server.queue.loop === 'true') {
              server.queue.loop = 'false';
              deleteAfterSend('Döngüden çıktı', messageDeleteTime, reaction.message);
            }
            else {
              server.queue.loop = 'true';
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
              server.queue.name.pop();
              server.queue.time.pop();
              server.queue.thumbnail.pop();
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
        case '❤️':
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
        break
      }
      reaction.users.remove(user)
      })
}