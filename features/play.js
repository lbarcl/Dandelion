const config = require('../config.json');
const { MessageEmbed } = require('discord.js');
const serverScheme = require('../schemes/server-scheme');
const userScheme = require('../schemes/user-scheme');
const { scrapePlaylist } = require("youtube-playlist-scraper");
const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher(config.api);
const mongo = require('../utils/mongo');
const ytdl = require('ytdl-core');

module.exports = async (client) => {
  const cache = {};
  const messageDeleteTime = 10000;
  var messageContent = '';
  client.on('message', async (message) => {
    // Kurulum işlemleri
    const { guild, channel } = message;
    var perServer = setup(cache, guild);
    perServer.guildId = guild.id;
    // Veritabanı işlemleri
    if (!perServer.channelId && !message.author.bot && message.content != '-st') {
      await mongo().then(async mongoose => {
        try {
          console.log('Veritabanına bilgi almak için bağlanıyor, ' + guild.id);
          const result = await serverScheme.findOne({ _id: guild.id });
          if (result != null) {
            perServer.channelId = result.channelId;
            perServer.messageId = result.messageId;
          }
        } finally {
          console.log('Bağlantı kapanıyor ' + guild.id);
          mongoose.connection.close();
        }
      })
    }

    if (!perServer.channelId) {
      return;
    }
    // Radio kanalı özel işlemleri
    if (channel.id === perServer.channelId && !message.author.bot) {
      // Mesajı gönderen şahsiyet ses kanalında mı?
      if (!message.member.voice.channelID && !message.author.bot) {
        deleteAfterSend('Kullanabilmek için ses kanalında olman gerek', messageDeleteTime, message);
        message.delete();
        return;
      }
      messageContent = message.content;

      // Girilen içerik komut kontorlü
      switch (messageContent) {
        case 'geç':
          message.delete();
          perServer.list.shift();
          perServer.name.shift();
          perServer.time.shift();
          perServer.thumbnail.shift();
          // ilk öğe boş ise
          if (!perServer.list[0]) {
            embedEdit('noMusic', perServer, channel);
            message.member.voice.channel.leave();
            return;
          }
          // ilk öğe dolu ise
          embedEdit('playing', perServer, channel);
          message.member.voice.channel.join().then(function(connection) {
            play(perServer, connection, channel);
          })
          return;
          break;
        case 'ayrıl':
          message.delete();
          // eğer liste öğeleri dolu ise döngüye girip listeyi temizle
          if (perServer.list[0]) {
            for (var i = perServer.list.length; i > 0; i--) {
              perServer.list.pop();
              perServer.name.pop();
              perServer.time.pop();
              perServer.thumbnail.pop();
            }
          }
          deleteAfterSend('Kanaldan ayrılıyor', messageDeleteTime, message);
          message.member.voice.channel.leave();
          embedEdit('noMusic', perServer, channel);
          return;
          break;
        case 'döngü':
          if (perServer.list[0]) {

            if (perServer.ıslooping === 'true') {
              perServer.ıslooping = 'false';
              deleteAfterSend('Döngüden çıktı', messageDeleteTime, message);
            }
            else {
              perServer.ıslooping = 'true';
              deleteAfterSend('Şarkı döngüye açıldı', messageDeleteTime, message);
            }
            embedEdit('playing', perServer, channel);
          }
          message.delete();
          return;
          break;
        case 'temizle':
          message.delete();
          // eğer liste öğeleri dolu ise döngüye girip listeyi temizle
          if (perServer.list[1]) {
            for (var i = perServer.list.length; i > 0; i--) {
              if (!perServer.list[1]) {
                break;
              }
              perServer.list.pop();
              perServer.name.pop();
              perServer.time.pop();
              perServer.thumbnail.pop();
            }
            deleteAfterSend('Sıra temizlendi', messageDeleteTime, message);
            if (!perServer.list[0]) {
              embedEdit('noMusic', perServer, channel);
            }
            else {
              embedEdit('playing', perServer, channel);
            }
            return;
          }
          deleteAfterSend('Sırada içerik yok', messageDeleteTime, message);
          return;
          break;
        case 'beğen':
          message.delete();
          await addToFav(perServer, message, messageDeleteTime)
          return;
          break;
        case 'beğenme':
          message.delete();
          await unFav(perServer, message, messageDeleteTime)
          return;
          break;
        case 'beğendiklerim':
          message.delete();
          var x = false;
          if (perServer.list[0]) x = true
          perServer = await place(perServer, message, messageDeleteTime);
          if (!x) {
            embedEdit('playing', perServer, channel);
            if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
              play(perServer, connection, channel);
            })
          }
          embedEdit('playing', perServer, channel);
          return;
          break;
        case 'ekle':
          message.delete();
          await addToServerList(perServer, message, messageDeleteTime)
          return;
          break;
        case 'çıkar':
          message.delete();
          await removeFromServerList(perServer, message, messageDeleteTime)
          return;
          break;
        case 'çalmalistesi':
          message.delete();
          var x = false;
          if (perServer.list[0]) x = true
          perServer = await pasteList(perServer, message, messageDeleteTime);
          if (!x && perServer.list[0]) {
            embedEdit('playing', perServer, channel);
            if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
              play(perServer, connection, channel);
            })
          } else {
            return
          }
          embedEdit('playing', perServer, channel);
          return;
          break;
      }

      message.delete();

      if (perServer.list[0]) {
        perServer = await songAdd(perServer, messageContent, messageDeleteTime, message);
        embedEdit('playing', perServer, channel);
        return;
      }

      perServer = await songAdd(perServer, messageContent, messageDeleteTime, message);

      embedEdit('playing', perServer, channel);
      if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) { // bir ses kanalında değil ise komutu çalıştıran kullanıcının ses kanalına girip listeyi çalmaya başlar
        play(perServer, connection, channel);
      })

    }
  })
}

function setup(cache, guild) {
  if (!cache[guild.id]) {
    cache[guild.id] = { guildId: '', channelId: '', messageId: '', list: [], name: [], time: [], thumbnail: [], ıslooping: 'false' };
  }
  var data = cache[guild.id];
  return data;
}

function play(perServer, connection, channel) {

  perServer.dispatcher = connection.play(ytdl(perServer.list[0], { filter: "audioonly" }),
    { volume: 0.25 });
  perServer.dispatcher.on('finish', () => {
    if (perServer.ıslooping === 'false') {
      perServer.list.shift();
      perServer.name.shift();
      perServer.time.shift();
      perServer.thumbnail.shift();
      if (perServer.list[0]) {
        play(perServer, connection, channel)
        embedEdit('playing', perServer, channel);
        return;
      }
    } else if (perServer.ıslooping === 'true') {
      perServer.list.push(perServer.list[0]);
      perServer.name.push(perServer.name[0]);
      perServer.time.push(perServer.time[0]);
      perServer.thumbnail.push(perServer.thumbnail[0]);
      perServer.list.shift();
      perServer.name.shift();
      perServer.time.shift();
      perServer.thumbnail.shift();
      play(perServer, connection, channel);
      embedEdit('playing', perServer, channel);
      return;
    }
    var guild = perServer.dispatcher.player.voiceConnection.channel.guild;
    connection.disconnect();
    embedEdit('noMusic', perServer, guild.channels.cache.get(perServer.channelId));
  })
}

function validatePlayList(url) {
  if (url.includes('https://www.youtube.com/playlist?list=')) {
    return url.replace('https://www.youtube.com/playlist?list=', '');
  }
}

async function songAdd(perServer, messageContent, messageDeleteTime, message) {

  // Sıraya ekleme
  // playlist ekeleme
  var id = validatePlayList(messageContent);
  if (id) {
    const playList = await scrapePlaylist(id);
    for (var i = 0; i < playList.playlist.length; i++) {
      perServer.list.push(playList.playlist[i].url);
      perServer = await urlToInfo(perServer, playList.playlist[i].url);
    }
    deleteAfterSend(`${playList.playlist.length} video ekleniyor`, messageDeleteTime, message);
  } // url ekleme
  else if (ytdl.validateURL(messageContent)) {
    perServer.list.push(messageContent);
    perServer = await urlToInfo(perServer, messageContent);
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await searcher.search(messageContent);
    if (!ytdl.validateURL(result.first.url)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
      return;
    }
    perServer.list.push(result.first.url);
    perServer = await urlToInfo(perServer, result.first.url);
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  }
  return perServer;
}

async function embedEdit(isDefault, perServer, channel) {
  var embedMessagge = await channel.messages.fetch(perServer.messageId); // Özel kanal içerisindeki bilgi mesajını bulma
  const embed = new MessageEmbed();
  // NoMusic haline çevirme
  switch (isDefault) {
    case 'noMusic': // NoMusic haline çevirme
      embed.setTitle(config.noMusicTitle)
      embed.setURL('http://devb.ga')
      embed.setImage(config.noMusic)
      embed.setColor(config.embedColor)
      embed.setDescription('Şuan çalmakta olan hiç bir müzik yok')
      break;
    case 'playing': // Çalan şarkı bilgilerini gösterme
      var footerText = `Şuan ${perServer.name[0]} çalıyor | Süre ${perServer.time[0]} | Döngü ${perServer.ıslooping}`
      embed.setTitle(perServer.name[0])
      embed.setURL(perServer.list[0])
      embed.setImage(perServer.thumbnail[0])
      embed.setColor(config.embedColor)
      embed.setFooter(footerText)
      if (perServer.list[0]) {
        var sPoint = perServer.name.length - 1;
        if (perServer.name.length > 24) {
          sPoint = 25;
        }
        for (var i = sPoint; i >= 1; i--) {
          if (i === 25) {
            embed.addField(`Ve ${perServer.list.length - 24} daha fazla video`, '...');
          }
          var t = perServer.time[i]
          embed.addField(`${i} - ${perServer.name[i]}`, "`" + t + "`");
          if (i === 1) {
            break;
          }
        }
      }
      break;
  }
  embedMessagge.edit(embed);
}

async function deleteAfterSend(text, timeOut, message) {
  var m = await message.reply(text);
  setTimeout(function() { m.delete(); }, timeOut);
}

async function urlToInfo(perServer, url) {
  var vInfo = await getBasicInfo(url);
  vInfo = vInfo.player_response.videoDetails;
  var thumbnail = vInfo.thumbnail.thumbnails;
  perServer.name.push(vInfo.title);
  perServer.time.push(calculateTime(vInfo.lengthSeconds));
  perServer.thumbnail.push(thumbnail[thumbnail.length - 1].url);
  return perServer;
}

async function getBasicInfo(url) {
  if (ytdl.validateURL(url)) {
    var videoInfo = await ytdl.getBasicInfo(url);
    return videoInfo;
  }
  return;
}

async function addToFav(perServer, message, messageDeleteTime) {
  const user = message.member.user;
  if (perServer.list[0]) {

    await mongo().then(async mongoose => {
      try {
        console.log('Veritabanına bilgi almak için bağlanıyor, ' + user.id);
        const result = await userScheme.findOne({ _id: user.id });
        if (result) {
          await userScheme.findByIdAndUpdate({ _id: user.id }, {
            $addToSet: {
              favoriteSongs: perServer.list[0],
            }
          })
          deleteAfterSend('Beğenilenlere eklendi', messageDeleteTime, message);
        } else {
          deleteAfterSend('Şarkıyı beğenmek için önce kayıt olmanız gerekiyor, kayıt olmak için `-reg` yazmanız yeterli', messageDeleteTime, message);
        }

      } finally {
        console.log('Bağlantı kapanıyor ' + user.id);
        mongoose.connection.close();
      }
    })
  }
  else {
    deleteAfterSend('Şuan çalmakta olan şarkı olmadığından beğenemezsin', messageDeleteTime, message);
  }
}

async function unFav(perServer, message, messageDeleteTime) {
  const user = message.member.user;
  if (perServer.list[0]) {

    await mongo().then(async mongoose => {
      try {
        console.log('Veritabanına bilgi almak için bağlanıyor, ' + user.id);
        const result = await userScheme.findOne({ _id: user.id });
        if (result) {
          await userScheme.findByIdAndUpdate({ _id: user.id }, {
            $pull: {
              favoriteSongs: perServer.list[0],
            }
          })
          deleteAfterSend('Beğenilenlerden çıkarıldı', messageDeleteTime, message);
        } else {
          deleteAfterSend('Şarkıyı beğenilenlerden çıkarmak için kayıt olmanız gerekiyor, kayıt olmak için `-reg` yazmanız yeterli', messageDeleteTime, message);
        }

      } finally {
        console.log('Bağlantı kapanıyor ' + user.id);
        mongoose.connection.close();
      }
    })
  }
  else {
    deleteAfterSend('Şuan çalmakta olan şarkı olmadığından beğenemezsin', messageDeleteTime, message);
  }
}

async function place(perServer, message, messageDeleteTime) {
  var list = [];
  await mongo().then(async mongoose => {
    try {
      console.log('Veritabanına bilgi almak için bağlanıyor, ' + message.member.user.id);
      const result = await userScheme.findOne({ _id: message.member.user.id });
      if (result != null) {
        list = result.favoriteSongs;
      }
      else {
        deleteAfterSend("Sisteme kayıt olmamışsınız, kayıt olmak için `-reg` yazmanız yeterli", messageDeleteTime, message);
      }
    } finally {
      console.log('Bağlantı kapanıyor ' + message.member.user.id);
      mongoose.connection.close();
    }
  })

  if (list[0]) {
    for (var i = 0; i < list.length; i++) {
      perServer.list.push(list[i]);
      perServer = await urlToInfo(perServer, list[i]);
    }
    deleteAfterSend(`Beğenilen şarkılar ekleniyor`, messageDeleteTime, message);
    return perServer;
  }
  deleteAfterSend("Beğenilen şarkılarınız boş, şarkı beğenmek için `beğen` yazmanız yeterli ", messageDeleteTime, message);
}

async function addToServerList(perServer, message, messageDeleteTime) {
  const {guild} = message;
  if (perServer.list[0]) {

    await mongo().then(async mongoose => {
      try {
        console.log('Veritabanına bilgi almak için bağlanıyor, ' + guild.id);
        const result = await serverScheme.findOne({ _id: guild.id });
        if (result) {
          await serverScheme.findByIdAndUpdate({ _id: guild.id }, {
            $addToSet: {
              serverList: perServer.list[0],
            }
          })
          deleteAfterSend('Suncu listesine eklendi', messageDeleteTime, message);
        }
      } finally {
        console.log('Bağlantı kapanıyor ' + guild.id);
        mongoose.connection.close();
      }
    })
  }
  else {
    deleteAfterSend('Çalmakta olan şarkı olmadığı için listeye ekleyemzsiniz', messageDeleteTime, message);
  }
}

async function removeFromServerList(perServer, message, messageDeleteTime) {
  const {guild} = message;
  if (perServer.list[0]) {

    await mongo().then(async mongoose => {
      try {
        console.log('Veritabanına bilgi almak için bağlanıyor, ' + guild.id);
        const result = await serverScheme.findOne({ _id: guild.id });
        if (result) {
          await serverScheme.findByIdAndUpdate({ _id: guild.id }, {
            $pull: {
              serverList: perServer.list[0],
            }
          })
          deleteAfterSend('Suncu listesinden çıkarıldı', messageDeleteTime, message);
        }
      } finally {
        console.log('Bağlantı kapanıyor ' + guild.id);
        mongoose.connection.close();
      }
    })
  }
  else {
    deleteAfterSend('Çalmakta olan şarkı olmadığı için listeden çıkartamazsınız', messageDeleteTime, message);
  }
}

async function pasteList(perServer, message, messageDeleteTime){
  var list = [];
  const { guild } = message;
  await mongo().then(async mongoose => {
    try {
      console.log('Veritabanına bilgi almak için bağlanıyor, ' + guild.id);
      const result = await serverScheme.findOne({ _id: guild.id });
      if (result != null) {
        list = result.serverList;
      }
    } finally {
      console.log('Bağlantı kapanıyor ' + guild.id);
      mongoose.connection.close();
    }
  })

  if (list[0]) {
    for (var i = 0; i < list.length; i++) {
      perServer.list.push(list[i]);
      perServer = await urlToInfo(perServer, list[i]);
    }
    deleteAfterSend(`Sunucu listesi ekleniyor`, messageDeleteTime, message);
    return perServer;
  }
  deleteAfterSend("Suncu listesi boş, listeye şarkı eklemek için `ekle`", messageDeleteTime, message);
  return perServer;
}

function calculateTime(seconds){
  var time;
  var m = parseInt(seconds/60)
  var s = parseInt(seconds%60)
  if(m>60){
    var h = parseInt(m/60)
    m = parseInt(m%60)

    if(1 > (m/10)){
      m = `0${m}`
    }
    if(1 > (h/10)){
      h = `0${h}`
    }
    time = `${h}:${m}:${s}`
  }
  else {
    if(1 > (m/10)){
      m = `0${m}`
    }
    time = `${m}:${s}`
  }
  return time
}
