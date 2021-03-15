const {embedEdit} = require('../../../utils/messageWorks')
const {play} = require('../../../utils/Video&Song/ytdlThings')
const {firstPlace}  = require('../../../utils/Video&Song/songAdder')

module.exports = {
    name: 'ilkçal',
    aliases: ['ilkçal', 'iç'],
    minArgs: 1,
    guildOnly: true,
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}ilkçal [video-anahtar-kelime / video-url]` ",
    callback: async ({ message, client, text}) => {
        var server = client.servers[message.guild.id]
        server = await firstPlace(server, text, 10000, message)
        embedEdit('playing', server, client.channels.cache.get(server.channelId));
        message.reply(`${server.queue.name[0]} Şimdi oynatılıyor`)
        if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
            play(server, connection, client.channels.cache.get(server.channelId));
        })
        client.servers[message.guild.id] = server
    }
}