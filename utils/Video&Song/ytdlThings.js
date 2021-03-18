const ytdl = require('ytdl-core')
const {embedEdit} = require('../messageWorks')

module.exports = {play, urlToInfo, calculateTime}

function play(server, connection, channel) {

  server.dispatcher = connection.play(ytdl(server.queue.url[0], { filter: "audioonly" }),
    { volume: 0.25 });
  server.dispatcher.on('finish', () => {
    if (server.queue.loop === 'false') {
      server.queue.url.shift();
      server.queue.name.shift();
      server.queue.time.shift();
      server.queue.thumbnail.shift();
      server.queue.requester.shift();
      if (server.queue.url[0]) {
        play(server, connection, channel)
        embedEdit('playing', server, channel);
        return;
      }
    } else if (server.queue.loop === 'true') {
      server.queue.url.push(server.queue.url[0]);
      server.queue.name.push(server.queue.name[0]);
      server.queue.time.push(server.queue.time[0]);
      server.queue.thumbnail.push(server.queue.thumbnail[0]);
      server.queue.requester.push(server.queue.requester[0])
      server.queue.url.shift();
      server.queue.name.shift();
      server.queue.time.shift();
      server.queue.thumbnail.shift();
      server.queue.requester.shift();
      play(server, connection, channel);
      embedEdit('playing', server, channel);
      return;
    }
    var guild = server.dispatcher.player.voiceConnection.channel.guild;
    connection.disconnect();
    embedEdit('noMusic', server, channel);
  })
}

async function urlToInfo(url) {
  var vInfo = await getBasicInfo(url);
  if (vInfo) {
    vInfo = vInfo.player_response.videoDetails;
    var thumbnail = vInfo.thumbnail.thumbnails;
  
    var result = {}
    result.url = url
    result.title = vInfo.title
    result.time = vInfo.lengthSeconds
    result.image = thumbnail[thumbnail.length - 1].url
  }

  return result;
}

async function getBasicInfo(url) {
  if (ytdl.validateURL(url)) {
    var videoInfo = await ytdl.getBasicInfo(url);
    return videoInfo;
  }
  return;
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
