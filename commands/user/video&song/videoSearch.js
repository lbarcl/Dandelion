const {MessageEmbed} = require('discord.js')
const ytdl = require('ytdl-core')
const { YTSearcher } = require('ytsearcher')
const config = require('../../../config.json')
const searcher = new YTSearcher(config.api.youtube.dataV3.secondry)

module.exports = {
    name: 'videobul',
    aliases: ['videobul', 'vb'],
    minArgs: 1,
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}videbul [video-anahtar-kelime / video-url]` yazmanız yeterli",
    callback: async ({ message, client, text }) => {
        var url;
        if(ytdl.validateURL(text)){
            url = args[0];
        } 
        else{
            try {
                let result = await searcher.search(text, { type: 'video' });
                if(!ytdl.validateURL(result.first.url)) return message.reply("Girdiğiniz bilgiler ile bir video bulunamadı");
                url = result.first.url;
            } catch (e) {
                console.error(e)
                message.reply("Girdiğiniz bilgiler ile bir video bulunamadı");
                return
            }
        }

        var vInfo = await ytdl.getBasicInfo(url);
        vInfo = vInfo.player_response.videoDetails;
        var thumbnail = vInfo.thumbnail.thumbnails;
        thumbnail[thumbnail.length - 1].url
        var time = calculateTime(vInfo.lengthSeconds)

        const embed = new MessageEmbed()
        .setTitle(vInfo.title)
        .setURL(url)
        .setAuthor(vInfo.author)
        .setColor(client.config.embed.color)
        .setDescription(vInfo.shortDescription.split('.')[0])
        .setFooter(`${vInfo.viewCount} görüntülenme | ${time}`)
        .setImage(thumbnail[thumbnail.length - 1].url);

        message.channel.send(embed);
    }
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