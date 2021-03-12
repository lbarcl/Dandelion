const setup = require('./setup')
const {deleteAfterSend, embedEdit} = require('./messageWorks')
const {listThing, favThing} = require('./favThing')
const {play} = require('./ytdlThings')
const {pasteList, place} = require('./listImport')
const {songAdd, firstPlace} = require('./songAdder')

module.exports = async (client) => {
  client.servers = {}
  const messageDeleteTime = 10000

  client.on('message', async (message) => {
    if (message.author.bot) return //gönderilen mesajın bot tarfından mı olup olmadığı kontrolü
    const {guild, channel, member} = message //guild , channel ve member değerlerinin mesajdan alınması
    var server = await setup(client.servers, guild) // cache guild kayıdı ve veritabanı bağlantısı
    if(server == null) return

    if(server.channelId != channel.id) return // mesajın özel kanala gönderilip gönderilmediği kontrolü
    message.delete() // mesajı silmek
    var args = message.content.split(' ')

    if(args[0] === '-i' && args[1]) {
      server = await firstPlace(server, message.content, messageDeleteTime, message)
      embedEdit('playing', server, channel);
      if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
        play(server, connection, channel);
      })
      return
    }
    else if(args[0] === '-i' && !args[1]) return deleteAfterSend(`Boş bir değer veremezsiniz`, messageDeleteTime, message)

    if(args[0] === '-t' && args[1]) {
      if(!server.queue.url[args[1]]) return deleteAfterSend(`${args[1]}. sırada şarkı yok`, messageDeleteTime, message)
      server.queue.url.unshift(server.queue.url[args[1]])
      server.queue.name.unshift(server.queue.name[args[1]])
      server.queue.time.unshift(server.queue.time[args[1]])
      server.queue.thumbnail.unshift(server.queue.thumbnail[args[1]])
      embedEdit('playing', server, channel);
      if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
        play(server, connection, channel);
      })
      return
    }
    else if(args[0] === '-t' && !args[1]) return deleteAfterSend(`Boş bir değer veremezsiniz`, messageDeleteTime, message)

    if (!member.voice.channelID) { // kullanıcının ses kanalında olup olmadığı kontrolü
      deleteAfterSend('Kullanabilmek için ses kanalında olman gerekli', messageDeleteTime, message) // belirli süre sonra silinen uyarı mesajı
      return
    }

    if (server.queue.url[0]) {
      server = await songAdd(server, message.content, messageDeleteTime, message);
      embedEdit('playing', server, channel);
      return;
    }

    server = await songAdd(server, message.content, messageDeleteTime, message);

    embedEdit('playing', server, channel);
    if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
      play(server, connection, channel);
    })

  })

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
