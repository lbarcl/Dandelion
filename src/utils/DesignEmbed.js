const { MessageEmbed } = require('discord.js')

module.exports = function (songs) {

    const embed = new MessageEmbed()
        .setTitle(songs[0].title)
        .setDescription(`${songs[0].length}`)
        .setImage(songs[0].image)
        .setURL(songs[0].url)
    
    if (songs.length > 1) {
        const limit = songs.length > 24 ? 24 : songs.length - 1
        
        for (let i = limit; i > 0; i--) {
            if (i == 24) {
                embed.addField(`${songs.length - 23} daha fazla şarkı...`, '...')
                continue
            }

            embed.addField(`${i} - ${songs[i].title}`, `${songs[0].length}`)
        }
    }
    
    return embed
}