const { MessageEmbed } = require('discord.js')
const mongo = require('../../../../utils/database/mongo')
const ytdl = require('ytdl-core')

module.exports = {
  name: 'çalmalistesineekle',
  aliases: ['çalmalistesindençıkar', 'çç'],
  minArgs: 2,
  maxArgs: 2,
  description: 'Kullanıcının istediği çalma listesine şarkı ekler',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}çalmalistesineekle [çalmalistesi-id] [video-linki]` yazmanız yeterli",
  callback: async ({ message, client, args }) => {
        await mongo().then(async mongoose => {
            try{

                const user = await client.DBUser.findById(message.author.id)
                if (!user) return message.reply('Sisteme kayıtlı değilsiniz, kayıt olmak için `{PREFIX}kayıt` yazmanız yeterli')
                const list = await client.DBPlaylist.findById(args[0])
                if (!list) return message.reply('Girdiğiniz Id ile bir çalma listesi yok')
                if (!ytdl.validateURL(args[1])) return message.reply('Girdiğiniz link ile bir video bulunamadı')

                var includes = false
                list.list.forEach(item => {
                  if (item == args[1]) includes = true
                }) 
                if (includes == true) return message.reply('Çalma listenizde böyle bir şarkı yok') 
                const info = await ytdl.getBasicInfo(args[1])
                await client.DBPlaylist.findByIdAndUpdate({ _id: args[0] }, {
                    $pull: {
                        list: args[1]
                    }
                })

                const embed = new MessageEmbed()
                .setTitle(`${list.title}`)
                .setDescription(`${info.player_response.videoDetails.title} listeden çıkarıldı`)
                message.reply(embed)
            }finally {
                mongoose.connection.close()
            }
        })
    }
}