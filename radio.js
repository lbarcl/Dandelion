const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const mongo = require('./utils/mongo')
const {token} = require('./config.json')
const main = require('./playSystem/main')
const setup = require('./commands/setup')
const search = require('./commands/videoSearch');
const help = require('./commands/help');
const favorite = require('./commands/favorite');
const update = require('./commands/test')

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

    await setup(client)

    await search(client);

    await help(client);

    await favorite(client);

  //  await update(client)

  });

  client.login(token);
