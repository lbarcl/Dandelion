const {songAdd} = require('../../utils/Video&Song/songAdder')
const {play} = require('../../utils/Video&Song/ytdlThings')
const {deleteAfterSend, embedEdit} = require('../../utils/messageWorks')
const setup = require('../../utils/setup')

module.exports = (client) => {
    const messageDeleteTime = 10000

  client.on('message', async (message) => {
    var c = message.content.toLowerCase()
    if (c.startsWith('-kurulum') || c.startsWith('-kr')) return
    if (message.author.bot) return //gönderilen mesajın bot tarfından mı olup olmadığı kontrolü
    const {guild, channel, member} = message //guild , channel ve member değerlerinin mesajdan alınması
    var server = await setup(client.servers, guild) // cache guild kayıdı ve veritabanı bağlantısı
    if(server == null) return

    if(server.channelId != channel.id) return // mesajın özel kanala gönderilip gönderilmediği kontrolü
    message.delete() // mesajı silmek

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
    if(!server.queue.url[0]) return
    embedEdit('playing', server, channel);
    if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
      play(server, connection, channel);
    })

  })
}