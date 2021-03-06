const serverScheme = require('../schemes/server-scheme');
const userScheme = require('../schemes/user-scheme');
const mongo = require('../utils/mongo');
const {deleteAfterSend} = require('./messageWorks')

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
        if(server.list[0] == song){
          b = true
        }
      })

      if(b){
        await userScheme.findByIdAndUpdate({ _id: user.id }, {
          $pull: {
            favoriteSongs: server.list[0],
          }
        })
        deleteAfterSend('Beğenilenlerden çıkarıldı', messageDeleteTime, message);
      }
      else {
        await userScheme.findByIdAndUpdate({ _id: user.id }, {
          $addToSet: {
            favoriteSongs: server.list[0],
          }
        })
        deleteAfterSend('Beğenilenlere eklendi', messageDeleteTime, message);
      }
    } finally {
      console.log(`Bağlantı kapanıyor [${user.id}]`);
      mongoose.connection.close();
    }
  })
}

async function listThing(server, message, messageDeleteTime, guild){
  await mongo().then(async mongoose => {
    try {
      console.log(`Veritabına kişi bilgisi almak için bağlanıyor [${guild.id}]`);
      const result = await serverScheme.findOne({ _id: guild.id });

      var b = false
      result.serverList.forEach(song => {
        if(server.list[0] == song){
          b = true
        }
      })

      if(b){
        await serverScheme.findByIdAndUpdate({ _id: guild.id }, {
          $pull: {
            serverList: server.list[0],
          }
        })
        deleteAfterSend('Listeden çıkarıldı', messageDeleteTime, message);
      }
      else {
        await serverScheme.findByIdAndUpdate({ _id: guild.id }, {
          $addToSet: {
            serverList: server.list[0],
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
