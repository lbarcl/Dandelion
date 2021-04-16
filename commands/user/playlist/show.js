const mongo = require('../../../utils/database/mongo')
const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'çalmalistesigöster',
    aliases: ['çlg'],
    minArgs: 1,
    maxArgs: 1,
    description: 'Çalmalistesi göstermek için 3 tane parametre girilebilir bunlar;\n`s` içerisinde bulunduğunuz sunucunun listesini görüntülemek için\n`b` kullanıcı beğenilenlerini görüntülemek için\n`çalma listesi ID` ID olarak verdiğiniz listeyi görüntüler',
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}çalmalistesigöster [s/b/ID]` yazmanız yeterli",
    guildOnly: true,
    callback: async ({ message, client, args }) => {
        await mongo().then(async (mongoose) => {
            try {
                var songs = await client.DBSong.find({})
                if (args[0] == 's'){
                    var items = []
                    var list = await client.DBPlaylist.findById(message.guild.id)
                    if (!list.items.length) return message.reply('Sunucu listesi boş')
                    for (let i = 0; i < list.length; i++){
                        for (let ğ = 0; ğ < songs.length; ğ++){
                            if (list.items[i] == songs[ğ].url) items.push(songs[ğ])
                        }
                    }

                    console.log(items)
                }
                else if (args[0] == 'b') {
                    var items = []
                    var list = await client.DBPlaylist.findById(message.author.id)
                    if (!list) return message.reply('Beğendiğiniz şarkı yok')
                    else if (!list.items.length) return message.reply('Bu liste boş')
                    for (let i = 0; i < list.length; i++){
                        for (let ğ = 0; ğ < songs.length; ğ++){
                            if (list.items[i] == songs[ğ].url) items.push(songs[ğ])
                        }
                    }

                    console.log(items)
                }
                else {
                    var items = []
                    var list = await client.DBPlaylist.findOne({_id: args[0]})
                    if (!list) return message.reply('Böyle bir liste bulunamadı')
                    if (list.info.owner != message.author.id && list.settings.private) return message.reply('Aradığınız liste gizli ve size ait olmayan bir liste bu sebepten ötürü bunu görüntüleme yetkiniz yok')
                    if (!list.items.length) return message.reply('Bu liste boş')
                    for (let i = 0; i < list.length; i++){
                        for (let ğ = 0; ğ < songs.length; ğ++){
                            if (list.items[i] == songs[ğ].url) items.push(songs[ğ])
                        }
                    }

                    console.log(items)
                }
            } catch (error) {
                console.error(error)
                message.reply('Üzgünüz kişi çalma listesini alırken bir hata meydana geldi.\nLütfen bir kaç dakika sonra tekrar deneyin, eğer sorun çözülmez ise `-sorunbildir` komutunu kullanın')
            } finally {
                mongoose.connection.close()
            }
        })
    }
}

function embedContiune(embed, list, index, message){
    
}