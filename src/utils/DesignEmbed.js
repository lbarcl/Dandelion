const { MessageEmbed } = require('discord.js')

module.exports = function (Player) {
    var footer = ''
    
    switch (Player.Loop) {
        case 'kapalı':
            if (Player.Songs.length > 1) {
                footer = `Listede ${Player.Songs.length} şarkı var`
            } else {
                footer = ''
            }
            break;
        case 'şarkı':
            if (Player.Songs.length > 1) {
                footer = `Listede ${Player.Songs.length} şarkı var | Şarkı döngüde`
            } else {
                footer = 'Şarkı döngüde'
            }
            break;
        case 'liste':
            if (Player.Songs.length > 1) {
                footer = `Listede ${Player.Songs.length} şarkı var | Liste döngüde`
            } else {
                footer = 'Liste döngüde'
            }
            break;
    }

    if (Player.Pause) {
        if (footer.length > 1) footer = 'Duraklatıldı | ' + footer
        else footer = 'Duraklatıldı'
    }

    const embed = new MessageEmbed()
        .setTitle(`${Player.Songs[0].title} [${Player.Songs[0].duration}]`)
        .setDescription(`<@${Player.Songs[0].requester}> tarafından eklendi`)
        .setImage(Player.Songs[0].image)
        .setURL(Player.Songs[0]?.sur || Player.Songs[0].yur)
    
    if (footer != '') embed.setFooter({text: footer})
    
    if (Player.Songs.length > 1) {
        const limit = Player.Songs.length > 24 ? 24 : Player.Songs.length - 1
        
        for (let i = limit; i > 0; i--) {
            if (i == 24) {
                embed.addField(`${Player.Songs.length - 23} daha fazla şarkı...`, '...')
                continue
            }

            embed.addField(`${i} - ${Player.Songs[i].title} [${Player.Songs[i].duration}]`, `<@${Player.Songs[i].requester}> tarafından eklendi`)
        }
    }
    
    return embed
}