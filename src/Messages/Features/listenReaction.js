module.exports = (client, instance) => {
    client.on('messageReactionAdd', (reaction, user) => {
        const message = reaction.message
        const emoji = reaction.emoji.name
        const guildData = client.guildData.get(message.guild.id)

        if (user.id == client.user.id) return
        else if (guildData.message.id != message.id) return
        
        
    })
}