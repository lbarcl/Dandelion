const command = require('../utils/command');
const config = require('../config.json');
const {MessageEmbed} = require('discord.js');

module.exports = async (client) => {
  command(client, ['deste', 'd'], async (message, args, text) =>{
    const owner = client.users.cache.get(config.owner)
    const title = args[0]
    if(!args[1]) return message.reply('Başlık boş bırakılamaz')
    const messageText = text.replace(args[0] + ' ', '')
    if(!args[1]) return message.reply('Mesaj içeriği boş olamaz')

    const embed = new MessageEmbed()
    .setTitle(title)
    .setDescription(messageText)
    .setAuthor(message.member.user.tag, message.member.user.avatarURL())
    .setColor(config.embedColor)

    owner.send(embed)
    message.reply('Mesajınız destek ekibine iletilmiştir, en kısa sürede geri dönülecek')
  })
}
