module.exports = (client, instance) => {
    client.on('messageReactionAdd', (reaction, user) => {
        const message = reaction.message
        console.log(reaction.emoji.name)
    })
}