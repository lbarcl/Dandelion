const {deleteAfterSend, embedEdit} = require('../messageWorks')
const {mongoCheck, mongoFind} = require('../database/infoGet')
const config = require('../../config.json');
//--------------------------Youtube-----------------------------------
const { scrapePlaylist } = require("youtube-playlist-scraper");
const { calculateTime } = require('./ytdlThings')
const ytdl = require('ytdl-core')
//--------------------------Spotify-----------------------------------
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyUri = require('spotify-uri')
const auth = require('../spotify')

module.exports = {songAdd, firstPlace}

function validatePlayList(url) {
  if (url.includes('https://www.youtube.com/playlist?list=')) {
    return url.replace('https://www.youtube.com/playlist?list=', '');
  }
}

async function songAdd(server, messageContent, messageDeleteTime, message) {

  // Sıraya ekleme
  if (messageContent.includes('spotify')){
   /* const uriResponse = spotifyUri.parse(messageContent)
    const spotifyApi = new SpotifyWebApi({clientId: config.api.spotify.client.id, clientSecret: config.api.spotify.client.secret})
    const authRespons = await auth( config.api.spotify.client.id, config.api.spotify.client.secret)
    if (!authRespons.access_token) return console.log('Red')
    spotifyApi.setAccessToken(authRespons.access_token)
    if (uriResponse.type == 'playlist'){
      const playlistResult = await spotifyApi.getPlaylist(uriResponse.id)  
      const list = playlistResult.body.tracks.items
      deleteAfterSend("`" + playlistResult.body.name + "` çalma listesinden " + list.length + " tane şarkı ekleniyor", messageDeleteTime, message);

      for(var i = 0; i < list.length; i++){
        const searchString = list[i].track.artists[0].name + ' - ' + list[i].track.name
        server.queue.url.push(await mongoCheck(searchString))
        server.queue.name.push(searchString)
        server.queue.time.push(calculateTime(list[i].track.duration_ms / 1000))
        server.queue.thumbnail.push(list[i].track.album.images[0].url)
        server.queue.requester.push(message.author.id)
      
        if (i == list.length - 1) embedEdit('playing', server, message.channel)
      }
    } */
  } // playlist ekeleme
  else if (validatePlayList(messageContent)) {
    const playList = await scrapePlaylist(validatePlayList(messageContent));
    for (var i = 0; i < playList.playlist.length; i++) {
      server = await shift(playList.playlist[i].url, message, server)
    }
    deleteAfterSend(`${playList.playlist.length} video ekleniyor`, messageDeleteTime, message);
  } // url ekleme
  else if (ytdl.validateURL(messageContent)) {
    server = await shift(messageContent, message, server)
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await mongoCheck(messageContent)
    if (!ytdl.validateURL(result)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
      return;
    }
    server = await shift(messageContent, message, server)
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
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