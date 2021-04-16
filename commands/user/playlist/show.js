const {mongoFind} = require('../../../utils/database/infoGet')
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
    callback: async ({ message, client }) => {

    }
}