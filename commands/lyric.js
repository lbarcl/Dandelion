const command = require('../utils/command')
const lyricsFetcher = require('lyrics-parse')
const config = require('../config.json')
const {MessageEmbed} = require('discord.js')

module.exports = async (client) => {
  command(client, ['lyric', 'l'], async (message) =>{
    const server = client.servers[message.guild.id]
    if(!server.queue.url[0]) return message.channel.send('Şuan çalmakta olan şarkı olmadğından şarkı sözü görüntüleyemezsiniz')
    var args = server.queue.name[0].split('-')
    result = await lyricsFetcher(args[0], args[1])
    if(!result) return message.channel.send('Şarkı sözü bulunamadı')
    const embed = new MessageEmbed()
    .setAuthor(message.member.user.username, message.member.user.avatarURL())
    .setTitle(server.queue.name[0])
    .setThumbnail(server.queue.thumbnail[0])
    .setDescription(result)
    .setColor(config.embedColor)
    message.channel.send(embed)
  })
}
