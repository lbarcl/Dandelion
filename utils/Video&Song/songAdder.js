const {deleteAfterSend, embedEdit} = require('../messageWorks')
const config = require('../../config.json');
//--------------------------Youtube-----------------------------------
const { scrapePlaylist } = require("youtube-playlist-scraper");
const {urlToInfo, urlToInfoFirst, calculateTime} = require('./ytdlThings')
const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher(config.api.youtube.dataV3.primary);
const ytdl = require('ytdl-core')
//--------------------------Spotify-----------------------------------
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyUri = require('spotify-uri')
const auth = require('../spotify')
//--------------------------Mongo-------------------------------------
const mongo = require('../mongo')
const videoSearchScheme = require('../../schemes/video-search-cheme');
const { Mongoose } = require('mongoose');

module.exports = {songAdd, firstPlace}

function validatePlayList(url) {
  if (url.includes('https://www.youtube.com/playlist?list=')) {
    return url.replace('https://www.youtube.com/playlist?list=', '');
  }
}

async function songAdd(server, messageContent, messageDeleteTime, message) {

  // Sıraya ekleme
  
  if (messageContent.includes('spotify')){
    const uriResponse = spotifyUri.parse(messageContent)
    const spotifyApi = new SpotifyWebApi({clientId: config.api.spotify.client.id, clientSecret: config.api.spotify.client.secret})
    const authRespons = await auth( config.api.spotify.client.id, config.api.spotify.client.secret)
    if (!authRespons.access_token) return console.log('Red')
    spotifyApi.setAccessToken(authRespons.access_token)
    switch (uriResponse.type){
      case 'playlist':
        const playlistResult = await spotifyApi.getPlaylist(uriResponse.id)  
        const list = playlistResult.body.tracks.items
        deleteAfterSend("`" + playlistResult.body.name + "` çalma listesinden " + list.length + " tane şarkı ekleniyor", messageDeleteTime, message);
        var i = 0
        list.forEach(async item => {
          const searchString = item.track.artists[0].name + ' - ' + item.track.name
          const searchResult = await mongoCheck(searchString)
          if(ytdl.validateURL(searchResult)){
            server.queue.url.push(searchResult)
            server.queue.thumbnail.push(item.track.album.images[0].url)
            server.queue.time.push(calculateTime(item.track.duration_ms / 1000))
            server.queue.name.push(searchString)
            server.queue.requester.push(message.author.id)
          }
          if (i == list.length - 1) embedEdit('playing', server, message.channel)
          i++
        })  
      break;
    }
  } // playlist ekeleme
  else if (validatePlayList(messageContent)) {
    const playList = await scrapePlaylist(validatePlayList(messageContent));
    for (var i = 0; i < playList.playlist.length; i++) {
      server.queue.url.push(playList.playlist[i].url);
      server = await urlToInfo(server, playList.playlist[i].url, message.member.user);
    }
    deleteAfterSend(`${playList.playlist.length} video ekleniyor`, messageDeleteTime, message);
  } // url ekleme
  else if (ytdl.validateURL(messageContent)) {
    server.queue.url.push(messageContent);
    server = await urlToInfo(server, messageContent, message.member.user);
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await mongoCheck(messageContent)
    if (!ytdl.validateURL(result)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
      return;
    }
    server.queue.url.push(result);
    server = await urlToInfo(server, result, message.member.user);
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  }
  return server;
}

async function firstPlace(server, messageContent, messageDeleteTime, message){
  if (ytdl.validateURL(messageContent)) {
    server.queue.url.unshift(messageContent);
    server = await urlToInfoFirst(server, messageContent)
    deleteAfterSend(`video başa ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await searcher.search(messageContent);
    if (!ytdl.validateURL(result.first.url)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
      return;
    }
    server.queue.url.unshift(result.first.url);
    server = await urlToInfoFirst(server, result.first.url, message.member.user)
    deleteAfterSend(`video başa ekleniyor`, messageDeleteTime, message);
  }
  return server;
}

async function mongoCheck(keyWord){
  let url
  await mongo().then(async mongoose => {
    try{
      let result = await videoSearchScheme.findOne({keyWords: keyWord})
      if (result){
        url = result.videoUrl
//      console.log('DB')
      } else {
        result = await searcher.search(keyWord, { type: 'video' })
        url = result.first.url
        let id = ytdl.getURLVideoID(url)
        result = await videoSearchScheme.findById(id)
        if (result){
          await videoSearchScheme.findByIdAndUpdate(id, {
            $addToSet: {
              keyWords: keyWord
            }
          })
        } else {
          await new videoSearchScheme({
            _id: id,
            keyWords: keyWord,
            videoUrl: url
          }).save()
        }
//        console.log('API')
      }
    }
    finally {
      mongoose.connection.close()
    }
  })
  return url
}