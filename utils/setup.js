const mongo = require('./mongo')
const serverScheme = require('../schemes/server-scheme')
const config = require('../config.json')

module.exports = setup


async function setup(cache, guild) {
  if (!cache[guild.id]) {
    cache[guild.id] = { channelId: '', messageId: '', embedImageUrl: '', queue: { url: [], name: [], time: [], thumbnail: [], requester: [], loop: 'false'}}

    await mongo().then(async mongoose => {
      try {
        console.log(`Veritabanına kanal bilgisi almak için bağlanıyor [${guild.id}]`)
        const result = await serverScheme.findOne({ _id: guild.id })
        if (result != null) {
          cache[guild.id].channelId = result.channelId
          cache[guild.id].messageId = result.messageId
          if (result.embedImageUrl) embedImageUrl = result.embedImageUrl
          else embedImageUrl = config.embed.image
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
