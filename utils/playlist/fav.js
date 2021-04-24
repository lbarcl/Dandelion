const connect = require('../database/connect')
const messageWorks = require('../API/messageWorks')

module.exports = async function (reaction, url, client, user) {
    const { message } = reaction
    const mongoose = await connect()
    try {
        var list = await client.DBPlaylist.findById(user.id)
        if (list) {

            var flag = false
            for (var i = 0; i < list.items.length; i++) {
                if (list.items[i] == url) {
                    flag = true
                    break
                }
            }
            if (flag) {
                await client.DBPlaylist.findByIdAndUpdate(user.id, { $pull: { items: url } })
                messageWorks.deleteAfterSend('Beğendiğiniz şarkılardan kaldırıldı', 10000, message)
            } else {
                await client.DBPlaylist.findByIdAndUpdate(user.id, { $addToSet: { items: url } })
                messageWorks.deleteAfterSend('Beğendiğiniz şarkılara eklendi', 10000, message)
            }
        } else {
            const newList = {
                _id: user.id,
                info: {
                    owner: user.id,
                    title: user.username,
                    type: 'favs'
                },
                settings: {
                    image: user.avatarURL()
                },
                items: [url]
            }
            await client.DBPlaylist(newList).save()
        }
    } catch (error) {
        messageWorks.deleteAfterSend('Beğendiğiniz şarkıyı eklerken bir hata meydana geldi. Daha sonra tekrar deneyiniz,\n eğer sorununuz çözlümez ise `-sorunbildir` komutunu kullanabilirsiniz.', 20000, message)
        console.log(error)
    } finally {
        mongoose.connection.close()
    }

}