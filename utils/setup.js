const mongo = require('./database/mongo')
const serverScheme = require('../schemes/server-scheme')
const config = require('../config.json')

module.exports = setup


async function setup(cache, guild) {
  if (!cache[guild.id]) {
    cache[guild.id] = { channelId: '', messageId: '', embedInfo: {imageUrl: '', hexColor: '', description: ''}, queue: { url: [], title: [], time: [], image: [], requester: [], loop: 'kapalı'}, serverOut: 'kapalı'}

    await mongo().then(async mongoose => {
      try {
        console.log(`Veritabanına kanal bilgisi almak için bağlanıyor [${guild.id}]`)
        const result = await serverScheme.findById(guild.id )
        if (result != null) {
          cache[guild.id].channelId = result.channel.id
          cache[guild.id].messageId = result.channel.message.id
          cache[guild.id].embedInfo.imageUrl = result.channel.message.imageUrl || config.embed.image
          cache[guild.id].embedInfo.hexColor = result.channel.message.hexColor || config.embed.color
          cache[guild.id].embedInfo.description = result.channel.message.description || config.embed.description
          cache[guild.id].embedInfo.serverOut = result?.settings?.serverOut || 'kapalı'

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
