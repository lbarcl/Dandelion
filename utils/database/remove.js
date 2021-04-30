const mongo = require('./connect')
module.exports = remove

async function remove(threshold, client){
    await mongo().then(async (mongoose) => {
        try {
            const videos = await client.DBSong.find({})
            for(var i = 0; i < videos.length; i++){
                if(!videos[i].lastTime) continue
                var dif = (Date.now() / 1000) - (videos[i].lastTime / 1000)
                dif = parseInt(dif)
                if (dif > threshold){
                    await client.DBSong.findByIdAndRemove(videos[i]._id)
                    client.users.cache.get(client.config.owner).send(`${videos[i].url} silindi`)
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            mongoose.connection.close()
        }
    })
}