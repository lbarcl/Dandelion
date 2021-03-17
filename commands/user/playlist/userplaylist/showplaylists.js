const { MessageEmbed } = require('discord.js')
const mongo = require('../../../../utils/mongo')

module.exports = {
  name: 'kullanıcılisteleri',
  aliases: ['kullanıcılisteleri', 'kl'],
  minArgs: 0,
  description: 'Kullanıcının beğenilen şarkılarını görüntüler',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}beğenilenler` yazmanız yeterli",
  callback: async ({ message, client }) => {
        await mongo().then(async mongoose => {
            try{
                const owner = message.mentions.users.first() || message.author
                const user = await client.DBUser.findById(owner.id)
                if(!user) return message.reply('Sisteme kayıtlı değilsiniz, kayıt olmak için `{PREFIX}kayıt yazmanız yeterli`')

                const lists = await client.DBPlaylist.find({ownerId: owner.id})
                if(!lists) return message.reply('Çalma listesi oluşturmamışsınız, oluşturmak için `{PREFIX}çalmalistesioluştur` veya `{PREFIX}ço`')
                embed(lists, owner, client.config, message)
            }finally {
                mongoose.connection.close()
            }
        })
    }
}

function embed(lists, owner, config, message){
    console.log('T')
    const baban = new MessageEmbed()
    .setTitle(`${owner.username} çalma listeleri`)
    .setAuthor(owner.username, owner.avatarURL())
    .setColor(config.embed.color)
    for(var i = 0; i < lists.length; i++){
        baban.addField(`${lists[i].title} - ${lists[i]._id}`, lists[i].description)

        if (i == 25) {
            for (var y = 0; y < 25; y++) {
              lists[y].shift();
            }
            message.channel.send(baban)
            embed(lists, owner, config, message)
        }
    }
    message.channel.send(baban)
}