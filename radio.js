const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const mongo = require('./utils/mongo')
const {token} = require('./config.json')
const main = require('./playSystem/main')
const commands = require('./commands/index')

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
        console.log('connected the mongodb')
      } finally {
        mongoose.connection.close()
      }
    })

    await main(client)

    await commands(client)
  });

  client.login(token);
