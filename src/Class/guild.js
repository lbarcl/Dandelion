const { MessageEmbed } = require('discord.js');
const Sentry = require("@sentry/node");

module.exports = class {
    constructor(ID) {
        this.id = ID;
        this.player
    }

    async Load(client, config) {
        const data = await client.db.findById(this.id);

        if (data) {
            this.embed = {
                title: config.embed.title,
                image: data.channel.message.imageUrl || config.embed.image,
                hexColor: data.channel.message.hexColor || config.embed.hexColor,
                description: data.channel.message.description || config.embed.description
            }

            this.channel = client.channels.cache.get(data.channel.id)
            if (!this.channel) await client.db.findByIdAndRemove(this.id)
            else {
                try {
                    await this.channel.messages.fetch()
                    this.message = this.channel.messages.cache.get(data.channel.message.id)
                    if (!this.message) {
                        this.sendEmbed(this.channel, client)
                    } else {
                        this.DefaultEmbed()
                        this.channel.messages.cache.each((message, id) => {
                            if (id != this.message.id) message.delete()
                        })
                    }
                } catch (err) {
                    Sentry.captureException(err);
                }
            }
        }
    }

    async sendEmbed(channel, client) {
        const papatya = new MessageEmbed()
            .setTitle(this.embed.title)
            .setColor(this.embed.hexColor)
            .setDescription(this.embed.description)
            .setImage(this.embed.image)

        const PapatyaMessage = await channel.send({ embeds: [papatya] }).catch(err => { throw err })

        const emojis = ['⏯️', '⏭️', '⏏️', '🔁', '🔀', '🆑']
        emojis.forEach(async (emoji) => {
            await PapatyaMessage.react(emoji);
        })

        this.message = PapatyaMessage
        client.db.findByIdAndUpdate(channel.guild.id, {'channel.message.id': PapatyaMessage.id})
    }

    async updateEmbed(embed) {
        embed.setColor(this.embed.hexColor)
        this.message.edit({ embeds: [embed] })
    }

    DefaultEmbed() {
        const papatya = new MessageEmbed()
            .setTitle(this.embed.title)
            .setColor(this.embed.hexColor)
            .setDescription(this.embed.description)
            .setImage(this.embed.image)
        
        this.updateEmbed(papatya)
    }
}