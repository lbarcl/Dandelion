const os = require('os');

module.exports = {
  name: 'sunucuinfo',
  aliases: ['info'],
  ownerOnly: true,
  minArgs: 1,
  maxArgs: 1,
  hidden: true,
  description: 'Botun kullanıldığı sunucular hakkıında bilgi verir',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}info [id]` yazmanız yeterli",
  callback: async ({ client, args }) => {
    var server = client.servers[args[0]]
    if (!server) return console.log(`${args[0]} ile sunucu yok`)
    else {
        console.log({
            channel: {
                id: server.channelId,
                message: {
                    id: server.messageId,
                    content: server.embedInfo
                }
            },
            queue: server.queue,
            dispatcher: server.dispatcher
        })
    }
  }
}
