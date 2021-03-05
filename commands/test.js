const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher(process.env.API);
const command = require('../utils/command');
const ytdl = require('ytdl-core');

module.exports = (client) => {
  command(client, 'test', async (message, args, text) =>{
    if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){ 
      connection.play(ytdl('https://www.youtube.com/watch?v=K1PCl5D-IpU', {filter: "audioonly"}), {volume: 0.25});
    })
  })
}