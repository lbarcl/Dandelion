
module.exports = {
  name: 'servers',
  aliases: ['servers'],
  ownerOnly: true,
  maxArgs: 0,
  hidden: true,
  description: 'Botun kullıldığı tüm sunucuları gösterir',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}servers` yazmanız yeterli",
  callback: async ({ client }) => {
    var servers = []
    client.guilds.cache.forEach(guild => {
        servers.push({"id": guild.id, "name": guild.name})
    })
    console.log(servers)
  }
}
