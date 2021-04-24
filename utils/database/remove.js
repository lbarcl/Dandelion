const mongo = require('./connect')
const videoInfoScheme = require('../../schemes/video-info')
module.exports = remove

async function remove(threshold){
    await mongo().then(async (mongoose) => {
        try {
            const videos = await videoInfoScheme.find({})
            for(var i = 0; i < videos.length; i++){
                if(!videos[i].lastTime) continue
                var dif = (Date.now() / 1000) - (videos[i].lastTime / 1000)
                dif = parseInt(dif)
                if (dif > threshold){
                    await videoInfoScheme.findByIdAndRemove(videos[i]._id)
            }
        }
        } catch (error) {
            console.error(error)
        } finally {
            mongoose.connection.close()
        }
    })
}