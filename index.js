const Discord = require('discord.js')
const mongo = require('./utils/database/connect')
const videoRemove = require('./utils/database/remove')
const setup = require('./utils/setup')
const config = require('./config.json')
const WOKCommands = require('wokcommands');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })


  client.on('ready', async () =>{

    client.user.setPresence({
      activity:{
        name: '-yardım',
        type: 'LISTENING',
      },
      status: 'online'
    })

    await mongo().then(mongoose => {
      try {
        console.log('Başarılı bir şekilde mongo veritabanına bağlandı')
      } catch (err){
        console.error(`Error\n ${err}`)
      } finally {
        mongoose.connection.close()
      }
    })

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

    client.DBServer = require('./schemes/server-scheme')
    client.DBPlaylist = require('./schemes/playlist-scheme')
    client.DBSong = require('./schemes/video-info') 
    client.config = config
    client.servers = {}
    
    try{
      await client.guilds.cache.forEach(async guild => 
        var server = await setup(client.servers, guild)
        client.servers[guild.id] = server
      })
    } catch (err) {
      console.error(`Hata\n${err}`)
    }

    setInterval(function(){
      var hour = new Date().getHours()
      if (hour == 23) {
        videoRemove(604800)
      }
    }, 1800000)
  });

  client.login(config.api.discord.bot.main);
