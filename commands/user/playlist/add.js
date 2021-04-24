const mongo = require('../../../utils/database/connect')
const songAdder = require('../../../utils/playlist/songAdder')

module.exports = {
    name: 'çalmalistesineekle',
    aliases: ['çle'],
    minArgs: 2,
    description: 'Çalma listesine şarkı ekeler',
    expectedArgs: '[s/b/ID] [spotifyURl/YouTubeURL/Anahtar kelime]',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}çalmalistesineekle [s/b/ID] [spotifyURl/YouTubeURL/Anahtar kelime]` yazmanız yeterli",
    guildOnly: true,
    callback: async ({ message, client, args, text }) => {
        var content = text.replace(`${args[0]} `, '')
        var songs = await songAdder(content)
        if (!songs) return message.reply('şarkı bulunamadı')
        await mongo().then(async (mongoose) => {
            add: try {
                if (args[0] == 's'){
                    if (!message.member.hasPermission('MANAGE_GUILD')){
                        message.reply('Bu listeyi editlemek için izniniz yok')
                        break add 
                    } 
                    var list = await client.DBPlaylist.findOne({_id: message.guild.id, 'info.owner': message.guild.id, 'info.type': 'server'})
                    if (list) {
                        await client.DBPlaylist.findByIdAndUpdate(message.guild.id, {$addToSet: {items: songs}})
                    } else {
                        const newList = {
                            _id: message.guild.id,
                            info: {
                                owner: message.guild.id,
                                title: message.guild.name,
                                type: 'server'
                            },
                            settings: {
                                image: message.guild.iconURL()
                            },
                            items: songs
                        }
                        await client.DBPlaylist(newList).save()
                    }
                    if (typeof songs == 'string') {
                        message.reply('`1` tane şarkı eklendi')
                    } else {
                        message.reply(`\`${songs.length}\` tane şarkı eklendi`)
                    }
                    
                }
                else if (args[0] == 'b') {
                    var list = await client.DBPlaylist.findOne({_id: message.author.id, 'info.owner': message.author.id, 'info.type': 'favs'})
                    if (list) {
                        await client.DBPlaylist.findByIdAndUpdate(message.author.id, {$addToSet: {items: songs}})
                    } else {
                        const newList = {
                            _id: message.author.id,
                            info: {
                                owner: message.author.id,
                                title: message.author.username,
                                type: 'favs'
                            },
                            settings: {
                                image: message.author.avatarURL()
                            },
                            items: songs
                        }
                        await client.DBPlaylist(newList).save()
                    }
                    if (typeof songs == 'string') {
                        message.reply('`1` tane şarkı eklendi')
                    } else {
                        message.reply(`\`${songs.length}\` tane şarkı eklendi`)
                    }
                }
                else {
                    var list = await client.DBPlaylist.findOne({_id: args[0], 'info.owner': message.author.id, 'info.type': 'custom'})
                    if (list) {
                        await client.DBPlaylist.findByIdAndUpdate(args[0], {$addToSet: {items: songs}})
                        if (typeof songs == 'string') {
                            message.reply('`1` tane şarkı eklendi')
                        } else {
                            message.reply(`\`${songs.length}\` tane şarkı eklendi`)
                        }
                    } else {
                        message.reply('Liste bulmadık bu sebeb ile şarkı ekleyemiyoruz')
                    }       
                }
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })
    }
}