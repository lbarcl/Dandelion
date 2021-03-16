const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'sorunbildir',
    aliases: ['sorunbildir', 'sbd'],
    minArgs: 2,
    description: 'Yardıma ihtiyaç duyduğunuzda bot destek ekibine mesaj iletilemek için kullanılır',
    expectedArgs: '[mesaj-başlığı] [mesaj]',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}sorunbildir [mesaj-başlığı] [mesaj]` yazmanız yeterli",
    callback: ({ message, client, args, text }) => {
        const owner = client.users.cache.get(client.config.owner)
        const title = args[0]
        const messagetext = text.replace(`${title} `, '')

        const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(messagetext)
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setColor(client.config.embedColor)
        owner.send(embed)
        message.reply('Mesajınız destek ekibine iletilmiştir, en kısa sürede geri dönülecektir')
    }
}