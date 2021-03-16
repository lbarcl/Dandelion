const {MessageEmbed} = require('discord.js')
const {embedEdit} = require('../../../utils/messageWorks')
const {play} = require('../../../utils/Video&Song/ytdlThings')

module.exports = {
    name: 'taşı',
    aliases: ['taşı', 't'],
    maxArgs: 1,
    minArgs: 1,
    guildOnly: true,
    description: 'Çalma listesindeki sırası girilen şarkıyı ilk sıraya çekip çalmaya başlar',
    expectedArgs: '[şarkının-sıradaki-yeri]',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}taşı [sıradaki-yeri]` ",
    callback: async ({ message, client, args }) => {
        var server = client.servers[message.guild.id]
        if(!server.queue.url[args[0]]) return message.reply(`${args[0]}. sırada şarkı yok`)
        server.queue.url.unshift(server.queue.url[args[0]])
        server.queue.name.unshift(server.queue.name[args[0]])
        server.queue.time.unshift(server.queue.time[args[0]])
        server.queue.thumbnail.unshift(server.queue.thumbnail[args[0]])
        server.queue.requester.unshift(server.queue.requester[args[0]])
        embedEdit('playing', server, client.channels.cache.get(server.channelId));
        message.reply(`${server.queue.name[0]} Şimdi oynatılıyor`)
        if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
          play(server, connection, client.channels.cache.get(server.channelId));
        })
        client.servers[message.guild.id] = server
    }
}