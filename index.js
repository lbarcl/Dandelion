const Discord = require('discord.js')
const mongo = require('./utils/mongo')
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
    client.DBUser = require('./schemes/user-scheme')
    client.DBPlaylist = require('./schemes/playlist-scheme')
    client.config = config
    client.servers = {}

  });

  client.login(config.api.discord.bot.main);
