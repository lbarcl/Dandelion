const { MessageEmbed } = require('discord.js');

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

    if (options?.type) {
        switch (options.type) {
            case 'embedError':
                embed.setTitle(content)
            embed.setColor(color.error)
            MessageContent = { embeds: [embed] }
            break;
        case 'embedWarning':
            embed.setTitle(content)
            embed.setColor(color.warning)
            MessageContent = { embeds: [embed] }
            break;
        case 'embedInfo':
            embed.setTitle(content)
            embed.setColor(color.info)
            MessageContent = { embeds: [embed] }
            break;
        default:
            MessageContent = content
        }
    } else {
        MessageContent = content
    }

    const message = await channel.send(MessageContent);

    setTimeout(() => { message.delete() }, timeInterval);
}