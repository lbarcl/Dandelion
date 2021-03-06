const setup = require('./setup')
const {deleteAfterSend, embedEdit} = require('./messageWorks')
const {listThing, favThing} = require('./favThing')
const {play} = require('./ytdlThings')
const {pasteList, place} = require('./listImport')
const songAdd = require('./songAdder')

module.exports = async (client) => {
  const cache = {}
  const messageDeleteTime = 10000

  client.on('message', async (message) => {
    if (message.author.bot || message.content.charAt(0) == '-') return //gönderilen mesajın bot tarfından mı veya komtu olup olmadığı kontrolü
    const {guild, channel, member} = message //guild , channel ve member değerlerinin mesajdan alınması
    var server = await setup(cache, guild) // cache guild kayıdı ve veritabanı bağlantısı
    server = server[guild.id]

    if(server.channelId != channel.id) return // mesajın özel kanala gönderilip gönderilmediği kontrolü
    message.delete() // mesajı silmek

    if (!member.voice.channelID) { // kullanıcının ses kanalında olup olmadığı kontrolü
      deleteAfterSend('Kullanabilmek için ses kanalında olman gerekli', messageDeleteTime, message) // belirli süre sonra silinen uyarı mesajı
      return
    }

    if (server.list[0]) {
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

    var server = await setup(cache, reaction.message.guild) // cache guild kayıdı ve veritabanı bağlantısı
    server = server[reaction.message.guild.id]

    if (reaction.message.id != server.messageId) return
    const member = reaction.message.guild.members.cache.get(user.id)
    switch (reaction.emoji.name){
      case '⏭️':
      server.list.shift()
      server.name.shift()
      server.time.shift()
      server.thumbnail.shift()
      if(!server.list[0]){
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
      if (server.list[0]) {
        for (var i = server.list.length; i > 0; i--) {
          server.list.pop();
          server.name.pop();
          server.time.pop();
          server.thumbnail.pop();
        }
      }
      deleteAfterSend('Kanaldan ayrılıyor', messageDeleteTime, reaction.message);
      member.voice.channel.leave();
      embedEdit('noMusic', server, reaction.message.channel);

      break
      case '🔁':
      if (server.list[0]) {

        if (server.ıslooping === 'true') {
          server.ıslooping = 'false';
          deleteAfterSend('Döngüden çıktı', messageDeleteTime, reaction.message);
        }
        else {
          server.ıslooping = 'true';
          deleteAfterSend('Şarkı döngüye açıldı', messageDeleteTime, reaction.message);
        }
        embedEdit('playing', server, reaction.message.channel);
      }
      break
      case '🆑':
      if (server.list[1]) {
        for (var i = server.list.length; i > 0; i--) {
          if (!server.list[1]) {
            break;
          }
          server.list.pop();
          server.name.pop();
          server.time.pop();
          server.thumbnail.pop();
        }
        deleteAfterSend('Sıra temizlendi', messageDeleteTime, reaction.message);
        if (!server.list[0]) {
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
      listThing(server, reaction.message, messageDeleteTime, reaction.message.guild)
    break
    case '#️⃣':
      var x = false;
      if (server.list[0]) x = true
      server = await place(server, user, messageDeleteTime, reaction.message)
      if(!server.list[0]) return
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
      if (server.list[0]) x = true
      server = await pasteList(server, reaction.message, messageDeleteTime)
      if(!server.list[0]) return
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
