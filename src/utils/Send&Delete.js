const { MessageEmbed, TextChannel } = require('discord.js');

module.exports = SendDelete

/**
 * Sends a message to channel and waits for some time to delete the message
 * @kind function
 * @param {string} content - The content of the message that will be send
 * @param {TextChannel} channel - The channle that message will be send
 * @param {number} timeInterval - The time that message will be deleted
 * @param {Object} options - Options for function
 * @param {('embedError'|'embedWarning'|'embedInfo')} options.type - Type of embed message
 */
async function SendDelete(content, channel, timeInterval, options) {
    const color = {
        info: '#0080FF',
        error: '#FF0000',
        warning: '#FFAA00'
    }
    var MessageContent
    const embed = new MessageEmbed()

    switch (options.type) {
        case 'embedError':
                embed.setTitle('Hata')
                embed.setColor(color.error)
                embed.setDescription(content)
            MessageContent = { embeds: [embed] }
            break;
        case 'embedWarning':
                embed.setTitle('Uyarı')
                embed.setColor(color.warning)
                embed.setDescription(content)
            MessageContent = { embeds: [embed] }
            break;
        case 'embedInfo':
                embed.setTitle('Bilgi')
                embed.setColor(color.info)
                embed.setDescription(content)
            MessageContent = { embeds: [embed] }
            break;
        default:
            MessageContent = content
    }

    const message = await channel.send(MessageContent);

    setTimeout(() => { message.delete() }, timeInterval);
}