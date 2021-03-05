const mongo = require('../utils/mongo')
const command = require('../utils/command');
const userScheme = require('../schemes/user-scheme');
const serverScheme = require('../schemes/server-scheme');
const config = require('../config.json');
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');

module.exports = async (client) => {
  command(client, ['beğendiklerim', 'b'], async (message) => {
    var list = [];
    var c = false;
    await mongo().then(async mongoose => {
      try {
        console.log('Veritabanına bilgi almak için bağlanıyor, ' + message.member.user.id);
        const result = await userScheme.findOne({ _id: message.member.user.id });
        if (result != null) {
          list = result.favoriteSongs;
        }
        else {
          message.reply("Sisteme kayıt olmamışsınız, kayıt olmak için `-reg` yazmanız yeterli");
          c = true;
        }
      } finally {
        console.log('Bağlantı kapanıyor ' + message.member.user.id);
        mongoose.connection.close();
      }
    })

    if (!c) {

      if (!list[0]) {
        message.reply('Üzgünüm beğendiğiniz herhangi bir şarkı yok, beğenmek için `beğen` yazmanız yeterli')
        return
      }

      embed(list, message, 1)
    }

  })

  command(client, ['sunuculistesi', 'sl'], async (message) => {
    var list = [];
    var c = false;
    const { guild } = message;
    await mongo().then(async mongoose => {
      try {
        console.log('Veritabanına bilgi almak için bağlanıyor, ' + guild.id);
        const result = await serverScheme.findOne({ _id: guild.id });
        if (result != null) {
          if (result.serverList) {
            list = result.serverList;
          }
        }
        else {
          message.reply("Sunucunuz için kurulum yapmamışsınız, `-st` yazarak kurulum yapabilirsiniz");
          c = true;
        }
      } finally {
        console.log('Bağlantı kapanıyor ' + message.member.user.id);
        mongoose.connection.close();
      }
    })

    if (!c) {

      if (!list[0]) {
        message.reply('Üzgünüm sunucu listesinde herhangi bir şarkı yok, eklemek için `ekle` yazmanız yeterli')
        return
      }

      embediki(list, message, 1)
    }

  })
}

async function embed(list, message, index) {
  const embed = new MessageEmbed()
    .setAuthor(message.member.user.username, message.member.user.avatarURL())
    .setTitle(`${message.member.user.username} tarafından beğenilenler`)
    .setColor(config.embedColor)
  for (var x = 0; x < list.length; x++) {
    if (ytdl.validateURL(list[x])) {

      var vdet = await ytdl.getBasicInfo(list[x])
      vdet = vdet.player_response.videoDetails;
      var name = `${index} - ${vdet.title}`;
      embed.addField(name, list[x])

      index++;
      if (x == 25) {
        for (var y = 0; y < 25; y++) {
          list.shift();
        }
        message.channel.send(embed)
        embed(list, message, index)
      }
    }
  }
  message.channel.send(embed)
}

async function embediki(list, message, index) {
  const { guild } = message
  const embed = new MessageEmbed()
    .setAuthor(guild.name, guild.iconURL())
    .setTitle(`${guild.name} şarkı listesi`)
    .setColor(config.embedColor)
  for (var x = 0; x < list.length; x++) {
    if (ytdl.validateURL(list[x])) {

      var vdet = await ytdl.getBasicInfo(list[x])
      vdet = vdet.player_response.videoDetails;
      var name = `${index} - ${vdet.title}`;
      embed.addField(name, list[x])

      index++;
      if (x == 25) {
        for (var y = 0; y < 25; y++) {
          list.shift();
        }
        message.channel.send(embed)
        embed(list, message, index)
      }
    }
  }
  message.channel.send(embed)
}