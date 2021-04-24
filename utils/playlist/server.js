const connect = require('../database/connect')
const messageWorks = require('../API/messageWorks')

module.exports = async function (reaction, url, client, guild) {
    const { message } = reaction
    const mongoose = await connect()
    try {
        var list = await client.DBPlaylist.findById(guild.id)
        if (list){

            var flag = false
            for (var i = 0; i < list.items.length; i++) {
                if (list.items[i] == url) {
                    flag = true
                    break
                }
            }
            if (flag) {
                await client.DBPlaylist.findByIdAndUpdate(guild.id, {$pull: {items: url}})
                messageWorks.deleteAfterSend('Sunucu listesinden kaldırıldı', 10000, message)
            } else {
                await client.DBPlaylist.findByIdAndUpdate(guild.id, {$addToSet: {items: url}})
                messageWorks.deleteAfterSend('Sunucu listesine eklendi', 10000, message)
            }
        } else {
            const newList = {
                _id: guild.id,
                info: {
                    owner: guild.id,
                    title: guild.name,
                    type: 'server'
                },
                settings: {
                    image: guild.iconURL()
                },
                items: [url]
            }
            await client.DBPlaylist(newList).save()
        }
    } catch (error) {
        messageWorks.deleteAfterSend('Sunucu listesini düzenlerken bir hata meydana geldi. Daha sonra tekrar deneyiniz,\n eğer sorununuz çözlümez ise `-sorunbildir` komutunu kullanabilirsiniz.', 20000, message)
        console.log(error)
    } finally {
        mongoose.connection.close()
    }

}