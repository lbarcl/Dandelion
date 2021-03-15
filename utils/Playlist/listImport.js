const serverScheme = require('../../schemes/server-scheme')
const userScheme = require('../../schemes/user-scheme')
const mongo = require('../mongo')
const {deleteAfterSend} = require('../messageWorks')
const {urlToInfo} = require('../Video&Song/ytdlThings')

module.exports = {
  pasteList,
  place
}

async function place(server, user, messageDeleteTime, message) {
  var list = [];
  await mongo().then(async mongoose => {
    try {
      console.log(`Veritabına kişi bilgisi almak için bağlanıyor [${user.id}]`);
      const result = await userScheme.findOne({ _id: user.id });
      if (result != null) {
        list = result.favoriteSongs;
      }
      else {
        deleteAfterSend("Sisteme kayıt olmamışsınız, kayıt olmak için `-reg` yazmanız yeterli", messageDeleteTime, message);
      }
    } finally {
      console.log(`Bağlantı kapanıyor [${user.id}]`);
      mongoose.connection.close();
    }
  })

  if (list[0]) {
    for (var i = 0; i < list.length; i++) {
      server.queue.url.push(list[i]);
      server = await urlToInfo(server, list[i], user);
    }
    deleteAfterSend(`Beğenilen şarkılar ekleniyor`, messageDeleteTime, message);
    return server;
  }
  deleteAfterSend("Beğenilen şarkılarınız boş, şarkı beğenmek için `❤️` basmanız yeterli ", messageDeleteTime, message);
}

async function pasteList(server, message, messageDeleteTime, user){
  var list = [];
  const { guild } = message;
  await mongo().then(async mongoose => {
    try {
      console.log(`Veritabına Sunucu bilgisi almak için bağlanıyor [${guild.id}]`);
      const result = await serverScheme.findOne({ _id: guild.id });
      if (result != null) {
        list = result.serverList;
      }
    } finally {
      console.log(`Bağlantı kapanıyor [${guild.id}]`);
      mongoose.connection.close();
    }
  })

  if (list[0]) {
    for (var i = 0; i < list.length; i++) {
      server.queue.url.push(list[i]);
      server = await urlToInfo(server, list[i], user);
    }
    deleteAfterSend(`Sunucu listesi ekleniyor`, messageDeleteTime, message);
    return server;
  }
  deleteAfterSend("Suncu listesi boş, listeye şarkı eklemek için `🗒️` basmanız yeterli", messageDeleteTime, message);
  return server;
}
