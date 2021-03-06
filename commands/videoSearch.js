const config = require('../config.json');
const {MessageEmbed} = require('discord.js');
const command = require('../utils/command');
const ytdl = require('ytdl-core');
const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher(config.api);

module.exports = async (client) => {
  command(client, ['videobul', 'vbul', 'video'], async (message, args, text) =>{
    var url;
    if(ytdl.validateURL(args[0])){
      url = args[0];
    } else{
      let result = await searcher.search(text);
      if(!ytdl.validateURL(result.first.url)){
        message.reply("Girdiğiniz bilgiler ile bir video bulunamadı");
        return;
      }
      url = result.first.url;
    }
    var vInfo = await ytdl.getBasicInfo(url);
    vInfo = vInfo.player_response.videoDetails;
    var thumbnail = vInfo.thumbnail.thumbnails;
    thumbnail[thumbnail.length - 1].url

    const embed = new MessageEmbed()
    .setTitle(vInfo.title)
    .setURL(url)
    .setAuthor(vInfo.author)
    .setColor(config.embedColor)
    .setDescription(vInfo.shortDescription.split('.')[0])
    .setFooter(`${vInfo.viewCount} görüntülenme | ${vInfo.lengthSeconds} saniye`)
    .setImage(thumbnail[thumbnail.length - 1].url);

    message.channel.send(embed);

  })
}