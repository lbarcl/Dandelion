const mongo = require('../utils/mongo')
const command = require('../utils/command');
const serverScheme = require('../schemes/server-scheme');
const userScheme = require('../schemes/user-scheme');
const config = require('../config.json');
const { MessageEmbed } = require('discord.js');

module.exports = async (client) => {
  command(client, ['st', 'setup'], async (message) => {
    const { member, guild } = message;

    if (!member.hasPermission('ADMINISTRATOR')) {
      message.reply("Bu komutu kullanabilmek için yetkiniz yok");
      return;
    }
    var server = {
      channelId: '',
      messageId: ''
    }
    const newChannel = await guild.channels.create(client.user.username, { type: 'text' });

    const embed = new MessageEmbed()
      .setTitle(client.user.username)
      .setURL('http://devb.ga')
      .setImage(config.noMusic)
      .setColor(config.embedColor)
      .setDescription('Şuan herhangi bir müzik oynamıyor')

    const newMessage = await newChannel.send(embed)

     newMessage.react('⏭️');
     newMessage.react('⏏️');
     newMessage.react('🔁');
     newMessage.react('🆑');
     newMessage.react('❤️');
     newMessage.react('🗒️');
     newMessage.react('#️⃣');
     newMessage.react('*️⃣');

    server.channelId = newChannel.id;
    server.messageId = newMessage.id;

    newChannel.setTopic("[⏭️] Sonraki şarkı | [⏏️] Kanaldan ayrıl | [🔁] Sırayı döngüye al/çıkar | [🆑] Sırayı temizle | [❤️] Çalan şarkıyı beğen/beğenme | [🗒️] Çalan şarkıyı sunucu listesine ekler/çıkartır | [#️⃣] Beğenilen şarkıları sıraya ekler | [*️⃣] Sunucu şarkı listesini sıraya ekler")

    await mongo().then(async mongoose => {
      try {
        console.log('connected the mongodb for setup at ' + guild.id);
        await new serverScheme({
          _id: guild.id,
          channelId: server.channelId,
          messageId: server.messageId,
        }).save()
      } finally {
        mongoose.connection.close();
      }
    })

    message.reply("Sunucu kurulumu tamamlandı")
  })

  command(client, ['reg', 'register'], async (message) => {
    const { member, guild } = message;

    await mongo().then(async mongoose => {
      try {
        console.log('connected the mongodb for register at ' + member.user.id);
        const result = await userScheme.findOne({ _id: member.user.id });
        if (!result) {
          await new userScheme({
            _id: member.user.id,
          }).save()
          message.reply('Sisteme başarlı bir şekilde kayıt oldunuz, aramıza hoşgeldin ' + member.user.username)
          return;
        }
        message.reply('Sisteme zaten kayıt olmuşsunuz, tekrar kayıt olamazsınız')
      } finally {
        mongoose.connection.close();
      }
    })
  })
}
