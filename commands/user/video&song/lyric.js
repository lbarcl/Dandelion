const lyricsFetcher = require('lyrics-parse')
const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'sözbul',
    aliases: ['sözbul', 'sb'],
    minArgs: 0,
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}sözbul` yazmanız yeterli",
    callback: async ({ message, client, args }) => {
        // Sunucu bilgileri alma
        const server = client.servers[message.guild.id]
            // Çalan şarkı olmadığından red
            if(!server.queue.url[0]) return message.reply('Şuan çalmakta olan şarkı olmadğından şarkı sözü görüntüleyemezsiniz')

        // Şarkıyı araştırmak
        var args = server.queue.name[0].split('-')
        result = await lyricsFetcher(args[0], args[1])
            // Söz bulamadıysa red
            if(!result) return message.reply('Şarkı sözü bulunamadı')

        // Embed oluşturma
        const embed = new MessageEmbed()
        .setAuthor(message.member.user.username, message.member.user.avatarURL())
        .setTitle(server.queue.name[0])
        .setThumbnail(server.queue.thumbnail[0])
        .setDescription(result)
        .setColor(client.config.embed.color)
        message.channel.send(embed)
    }
}