const { scrapePlaylist } = require("youtube-playlist-scraper");
const { YTSearcher } = require('ytsearcher');
const config = require('../config.json');
const searcher = new YTSearcher(config.api);
const ytdl = require('ytdl-core')
const {urlToInfo} = require('./ytdlThings')
const {deleteAfterSend} = require('./messageWorks')

module.exports = songAdd

function validatePlayList(url) {
  if (url.includes('https://www.youtube.com/playlist?list=')) {
    return url.replace('https://www.youtube.com/playlist?list=', '');
  }
}

async function songAdd(perServer, messageContent, messageDeleteTime, message) {

  // Sıraya ekleme
  // playlist ekeleme
  var id = validatePlayList(messageContent);
  if (id) {
    const playList = await scrapePlaylist(id);
    for (var i = 0; i < playList.playlist.length; i++) {
      perServer.list.push(playList.playlist[i].url);
      perServer = await urlToInfo(perServer, playList.playlist[i].url);
    }
    deleteAfterSend(`${playList.playlist.length} video ekleniyor`, messageDeleteTime, message);
  } // url ekleme
  else if (ytdl.validateURL(messageContent)) {
    perServer.list.push(messageContent);
    perServer = await urlToInfo(perServer, messageContent);
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  } // kelimeden araştırıp ekleme
  else {
    let result = await searcher.search(messageContent);
    if (!ytdl.validateURL(result.first.url)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
      return;
    }
    perServer.list.push(result.first.url);
    perServer = await urlToInfo(perServer, result.first.url);
    deleteAfterSend(`video ekleniyor`, messageDeleteTime, message);
  }
  return perServer;
}
