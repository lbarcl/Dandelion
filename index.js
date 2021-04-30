const Discord = require('discord.js')
const mongo = require('./utils/database/connect')
const videoRemove = require('./utils/database/remove')
const setup = require('./utils/setup')
const config = require('./config.json')
const WOKCommands = require('wokcommands');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })


  client.on('ready', async () =>{

    // Bot
    client.user.setPresence({
      activity:{
        name: '-yardım',
        type: 'LISTENING',
      },
      status: 'online'
    })
    client.config = config

    // Command Handler
    const disabledDefaultCommands = [
     'help',
     'command',
     'language',
     'requiredrole',
     'prefix'
    ]
    const messagesPath = ''

    new WOKCommands(client, {
      disabledDefaultCommands,
      commandsDir: 'commands',
      featureDir: 'features',
      showWarns: false,
      messagesPath,

    })
    .setDefaultPrefix(config.prefix)
    .setBotOwner(config.owner)

    // Database Init && Server Info save
    client.DBServer = require('./schemes/server-scheme')
    client.DBPlaylist = require('./schemes/playlist-scheme')
    client.DBSong = require('./schemes/video-info') 
    client.servers = {}

    var temp = []
    await mongo().then(async mongoose => {
      try {
        console.log('Başarılı bir şekilde mongo veritabanına bağlandı')
        temp = await client.DBServer.find({})
      } catch (err){
        console.error(`Error\n ${err}`)
      } finally {
        mongoose.connection.close()
      }
    })

    client.guilds.cache.forEach(guild => {
      const server = find(temp, guild.id)
      if (server){
        client.servers[guild.id] = { 
          channelId: server.channel.id, 
          messageId: server.channel.message.id, 
          embedInfo: {
            imageUrl: server.channel.message.imageUrl || config.embed.image,
            hexColor: server.channel.message.hexColor || config.embed.color, 
            description: server.channel.message.description || config.embed.description
          }, 
          queue: { 
            url: [], 
            title: [], 
            time: [], 
            image: [], 
            requester: [], 
            loop: 'kapalı'
          }, 
          serverOut: server?.settings?.serverOut || 'kapalı'
        }
        console.log(`[${guild.id}] Sunucu bilgileri kaydedildi`)
      }
    })

    // Tarihi geçen şarkıları silme tekrarlayıcısı
    setInterval(function(){
      var hour = new Date().getHours()
      if (hour == 23) {
        client.users.cache.get(config.owner).send(`Saat ${hour}:${new Date().getMinutes()} silinecek videolar kontrol ediliyor`)
        videoRemove(604800, client)
      }
    }, 1800000)
  });

  client.login(config.api.discord.bot.main);

  function find(servers, ID){
    var flag
    for(var i = 0; i < servers.length; i++){
      if (servers[i]._id == ID){
        flag = servers[i]
        break
      }
    }
    return flag
  }