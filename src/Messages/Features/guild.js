const GuildClass = require('../../Class/guild')

module.exports = (client, instance) => {
    client.on('guildCreate', async (guild) => {
        const Guild = new GuildClass(guild.id)
        await Guild.Load(client, client.config)
        client.guildData.set(Guild.id, Guild)

        const owner = await guild.fetchOwner()
        owner.send(`${client.user.username}'i davet ettiğiniz için teşekkür ederim!`)
        owner.send(`${client.user.username}'i kullanabilmek için kurulum yapmanız lazım bunun içinde kısaca \`${client.config.bot.prefix}kr\` yazarak yapabilirsiniz.`)
        owner.send(`Eğer bu sunucuda daha önceden kullandıysanız tekrar kurulum yapmanıza gerek yok, iyi eğlenceler :)`)
    })

    client.on('guildDelete', async (guild) => {
        client.guildData.delete(guild.id)

        const owner = await guild.fetchOwner()
        try {
            owner.send('Sizin aranızdan ayrılmak bizi derinden üzdü :(')
        } catch (err) {
            
        }
    })
}