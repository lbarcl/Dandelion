const ytdl = require('ytdl-core')
const {embedEdit} = require('./messageWorks')

module.exports = {play, urlToInfo}

function play(perServer, connection, channel) {

  perServer.dispatcher = connection.play(ytdl(perServer.list[0], { filter: "audioonly" }),
    { volume: 0.25 });
  perServer.dispatcher.on('finish', () => {
    if (perServer.ıslooping === 'false') {
      perServer.list.shift();
      perServer.name.shift();
      perServer.time.shift();
      perServer.thumbnail.shift();
      if (perServer.list[0]) {
        play(perServer, connection, channel)
        embedEdit('playing', perServer, channel);
        return;
      }
    } else if (perServer.ıslooping === 'true') {
      perServer.list.push(perServer.list[0]);
      perServer.name.push(perServer.name[0]);
      perServer.time.push(perServer.time[0]);
      perServer.thumbnail.push(perServer.thumbnail[0]);
      perServer.list.shift();
      perServer.name.shift();
      perServer.time.shift();
      perServer.thumbnail.shift();
      play(perServer, connection, channel);
      embedEdit('playing', perServer, channel);
      return;
    }
    var guild = perServer.dispatcher.player.voiceConnection.channel.guild;
    connection.disconnect();
    embedEdit('noMusic', perServer, channel);
  })
}

async function urlToInfo(perServer, url) {
  var vInfo = await getBasicInfo(url);
  if (vInfo) {
    vInfo = vInfo.player_response.videoDetails;
    var thumbnail = vInfo.thumbnail.thumbnails;
    perServer.name.push(vInfo.title);
    perServer.time.push(calculateTime(vInfo.lengthSeconds));
    perServer.thumbnail.push(thumbnail[thumbnail.length - 1].url);
  } else {
    perServer.list.pop()
  }
  return perServer;
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
