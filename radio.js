const Discord = require('discord.js');
const client = new Discord.Client();
const mongo = require('./utils/mongo');
const {token} = require('./config.json');
const setup = require('./commands/setup');
const radio = require('./features/play');
const search = require('./commands/videoSearch');
const help = require('./commands/help');
const favorite = require('./commands/favorite');
//const test = require('./commands/test');

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
        console.log('connected the mongodb');
      } finally {
        mongoose.connection.close();
      }
    })

    await setup(client);

    await radio(client);

    await search(client);

    await help(client);

    await favorite(client);

    //test(client);
  });

  client.login("Nzk3NTM3NzkzNjg5MTI0ODk0.X_n68w.i8f0MaXmIlingwYf0O-0a7h15ZY");

