const {deleteAfterSend, embedEdit} = require('../API/messageWorks')
const {mongoCheck, mongoFind} = require('../database/infoGet')
const config = require('../../config.json');
//--------------------------Youtube-----------------------------------
const { calculateTime } = require('./ytdlThings')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl');
//--------------------------Spotify-----------------------------------
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyUri = require('spotify-uri')
const auth = require('../API/spotify')

module.exports = {songAdd, firstPlace}

async function songAdd(server, messageContent, messageDeleteTime, message) {

  // Sıraya ekleme
  if (messageContent.includes('spotify')){
    const uriResponse = spotifyUri.parse(messageContent)
    const spotifyApi = new SpotifyWebApi({clientId: config.api.spotify.client.id, clientSecret: config.api.spotify.client.secret})
    const authRespons = await auth( config.api.spotify.client.id, config.api.spotify.client.secret)
    if (!authRespons.access_token) return console.log('Red')
    spotifyApi.setAccessToken(authRespons.access_token)
    if (uriResponse.type == 'playlist'){
      const playlistResult = await spotifyApi.getPlaylist(uriResponse.id)  
      const list = playlistResult.body.tracks.items
      deleteAfterSend("`" + playlistResult.body.name + "` çalma listesinden " + list.length + " tane şarkı ekleniyor", messageDeleteTime, message);

      for(var i = 0; i < list.length; i++){
        try{
          const searchString = list[i].track.artists[0] .name + ' - ' + list[i].track.name
          var result = await mongoCheck(searchString)
          server = await shift(result, message, server)
        } catch (err){
          console.error(err)
          deleteAfterSend("Şarkıyı bulamadık özür dileriz", messageDeleteTime, message);
        }
      }
    } 
    else if (uriResponse.type == 'track') {
      const track = await (await spotifyApi.getTrack(uriResponse.id)).body
      const searchString = track.artists[0].name + ' - ' + track.name
      try{
        var result = await mongoCheck(searchString)
        server = await shift(result, message, server)
      } catch (err){
        console.error(err)
        deleteAfterSend("Şarkıyı bulamadık özür dileriz", messageDeleteTime, message);
      }
    }
  } // playlist ekeleme
  else if (ytpl.validateID(messageContent)) {
    const playList = await ytpl(messageContent, {limit: Infinity})
    deleteAfterSend("`" + playList.title + "` çalma listesinden " + playList.items.length + " tane şarkı ekleniyor", messageDeleteTime, message)
    for (var i = 0; i < playList.items.length; i++) {
      server = await shift(playList.items[i].shortUrl, message, server)
    } 
  } // url ekleme
  else if (ytdl.validateURL(messageContent)) {
    server = await shift(messageContent, message, server)
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await mongoCheck(messageContent)
    if (!ytdl.validateURL(result)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
    } else {
      server = await shift(result, message, server)
      deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
    }
  }
  return server;
}

async function firstPlace(server, messageContent, messageDeleteTime, message){
  if (ytdl.validateURL(messageContent)) {
    server = await unShift(messageContent, message, server)
    deleteAfterSend(`video başa ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await mongoCheck(messageContent)
    if (!ytdl.validateURL(result)) return deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
    server = await unShift(url, message, server)
    deleteAfterSend(`video başa ekleniyor`, messageDeleteTime, message);
  }
  return server;
}

async function shift(url, message, server){
  const result = await mongoFind(url)
  server.queue.url.push(result.url)
  server.queue.title.push(result.title)
  server.queue.time.push(calculateTime(result.time))
  server.queue.image.push(result.image)
  server.queue.requester.push(message.author.id)
  return server
}

async function unShift(url, message, server){
  const result = await mongoFind(url)
  server.queue.url.unshift(result.url)
  server.queue.title.unshift(result.title)
  server.queue.time.unshift(calculateTime(result.time))
  server.queue.image.unshift(result.image)
  server.queue.requester.unshift(message.author.id)
  return server
}