const serverScheme = require('../../schemes/server-scheme');
const userScheme = require('../../schemes/user-scheme');
const mongo = require('../database/mongo');
const {deleteAfterSend} = require('../API/messageWorks')

module.exports = {
  favThing,
  listThing
}

async function favThing(server, message, messageDeleteTime, user){
  await mongo().then(async mongoose => {
    try {
      console.log(`Veritabına kişi bilgisi almak için bağlanıyor [${user.id}]`);
      const result = await userScheme.findOne({ _id: user.id });
      if (!result) {
        deleteAfterSend('Sisteme kayıtlı değilsiniz', messageDeleteTime, message);
        return
      }
      var b = false
      result.favoriteSongs.forEach(song => {
        if(server.queue.url[0] == song){
          b = true
        }
      })

      if(b){
        await userScheme.findByIdAndUpdate({ _id: user.id }, {
          $pull: {
            favoriteSongs: server.queue.url[0],
          },
          discordTag: user.tag,
          discordAvatar: user.avatarURL()
        })
        deleteAfterSend('Beğenilenlerden çıkarıldı', messageDeleteTime, message);
      }
      else {
        await userScheme.findByIdAndUpdate({ _id: user.id }, {
          $addToSet: {
            favoriteSongs: server.queue.url[0],
          },
          discordTag: user.tag,
          discordAvatar: user.avatarURL()
        })
        deleteAfterSend('Beğenilenlere eklendi', messageDeleteTime, message);
      }
    } finally {
      console.log(`Bağlantı kapanıyor [${user.id}]`);
      mongoose.connection.close();
    }
  })
}

async function listThing(server, message, messageDeleteTime, guild, member){
  if(!member.hasPermission('MANAGE_GUILD')){
    deleteAfterSend('Üzgünüm bu işlemi sadece `sunucuyu yönet` izni olanlar kullanabilir', messageDeleteTime, message);
    return
  }
  await mongo().then(async mongoose => {
    try {
      console.log(`Veritabına kişi bilgisi almak için bağlanıyor [${guild.id}]`);
      const result = await serverScheme.findOne({ _id: guild.id });

      var b = false
      result.serverList.forEach(song => {
        if(server.queue.url[0] == song){
          b = true
        }
      })

      if(b){
        await serverScheme.findByIdAndUpdate({ _id: guild.id }, {
          $pull: {
            serverList: server.queue.url[0],
          }
        })
        deleteAfterSend('Listeden çıkarıldı', messageDeleteTime, message);
      }
      else {
        await serverScheme.findByIdAndUpdate({ _id: guild.id }, {
          $addToSet: {
            serverList: server.queue.url[0],
          }
        })
        deleteAfterSend('Listeye eklendi', messageDeleteTime, message);
      }
    } finally {
      console.log(`Bağlantı kapanıyor [${guild.id}]`);
      mongoose.connection.close();
    }
  })
}
