const mongo = require('./database/mongo')
const serverScheme = require('../schemes/server-scheme')
const config = require('../config.json')

module.exports = setup


async function setup(cache, guild) {
  if (!cache[guild.id]) {
    cache[guild.id] = { channelId: '', messageId: '', embedInfo: {ımageUrl: '', hexColor: '', description: ''}, queue: { url: [], title: [], time: [], image: [], requester: [], loop: 'false'}}

    await mongo().then(async mongoose => {
      try {
        console.log(`Veritabanına kanal bilgisi almak için bağlanıyor [${guild.id}]`)
        const result = await serverScheme.findById(guild.id )
        if (result != null) {
          cache[guild.id].channelId = result.channelId
          cache[guild.id].messageId = result.messageId
          if (result.imageUrl) cache[guild.id].embedInfo.imageUrl = result.imageUrl
          else cache[guild.id].embedInfo.imageUrl = config.embed.image
          if (result.hexColor) cache[guild.id].embedInfo.hexColor = result.hexColor
          else cache[guild.id].embedInfo.hexColor = config.embed.color
          if (result.description) cache[guild.id].embedInfo.description = result.description
          else cache[guild.id].embedInfo.description = config.embed.description
        } else {
          console.log(`Kanal bilgisi bulunamadı [${guild.id}]`)
          cache[guild.id] = null
        }
      } finally {
        console.log(`Bağlantı kapanıyor [${guild.id}]`)
        mongoose.connection.close()
      }
    })
  }
  return cache[guild.id]
}
