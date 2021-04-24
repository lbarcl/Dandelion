const connect = require('../../../utils/database/connect')
const songAdder = require('../../../utils/Video&Song/songAdder')
const messageWorks = require('../../../utils/API/messageWorks')
const ytdl = require('../../../utils/Video&Song/ytdlThings')

module.exports = {
    name: 'sırayaekle',
    aliases: ['se'],
    minArgs: 1,
    maxArgs: 1,
    description: 'Çalmalistesini sıraya eklemek için 3 tane değer gerklidir bunlar;\n`s` içerisinde bulunduğunuz sunucunun listesini eklemek için\n`b` kullanıcı beğenilenlerini eklemek için\n`çalma listesi ID` ID olarak verdiğiniz listeyi ekler',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}sırayaekle [s/b/ID]` yazmanız yeterli",
    guildOnly: true,
    callback: async ({ message, client, args }) => {
        var ID, list, notFoundText
        switch (args[0]) {
            case 's':
                ID = message.guild.id
                notFoundText = `${message.guild.name} sunucusunun bir listesi yok`
                break;
            case 'b':
                ID = message.author.id
                notFoundText = `${message.author.username} beğendiği şarkı yok`
                break;
            default:
                ID = args[0]
                notFoundText = `\`${args[0]}\` ile bir liste bulmadık, geçerli bir ID verdiğinizden emin olun`
        }

        await connect().then(async (mongoose) => {
            try {
                list = await client.DBPlaylist.findById(ID)
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })

        if (!list) return message.reply(notFoundText)
        if (list.settings.private && message.author.id != list.info.owner) return message.reply('Üzgünüm ama bu listeyi çalmak için izniniz yok')
                

        if (client.servers[message.guild.id].dispatcher) {
            if (message.member.voice.channelID != client.servers[message.guild.id].dispatcher.player.voiceConnection.channel.id) { // kullanıcının ses kanalında olup olmadığı kontrolü
                message.reply('Aynı ses kanalında olmanız gerekli')
                return
            }
        } else if (!message.member.voice.channelID) return message.reply('Bir ses kanalında olmanız gerkli')

        var s = client.servers[message.guild.id].queue.url[0]
        for (var i = 0; i < list.items.length; i++) {
            client.servers[message.guild.id] = await songAdder.shift(list.items[i], message, client.servers[message.guild.id])
        }
        
        message.reply(`${list.info.title} çalmalistesinden ${list.items.length} adet şarkı ekleniyor`)
        messageWorks.embedEdit('playing', client.servers[message.guild.id], client.channels.cache.get(client.servers[message.guild.id].channelId))
        if (s) return
        message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
            ytdl.play(client.servers[message.guild.id], connection, client.channels.cache.get(client.servers[message.guild.id].channelId))
        })
    }
}