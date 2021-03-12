const { scrapePlaylist } = require("youtube-playlist-scraper");
const { YTSearcher } = require('ytsearcher');
const config = require('../config.json');
const searcher = new YTSearcher(config.api);
const ytdl = require('ytdl-core')
const {urlToInfo, urlToInfoFirst} = require('./ytdlThings')
const {deleteAfterSend} = require('./messageWorks')

module.exports = {songAdd, firstPlace}

function validatePlayList(url) {
  if (url.includes('https://www.youtube.com/playlist?list=')) {
    return url.replace('https://www.youtube.com/playlist?list=', '');
  }
}

async function songAdd(server, messageContent, messageDeleteTime, message) {

  // Sıraya ekleme
  // playlist ekeleme
  var id = validatePlayList(messageContent);
  if (id) {
    const playList = await scrapePlaylist(id);
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
    let result = await searcher.search(messageContent);
    if (!ytdl.validateURL(result.first.url)) {
      deleteAfterSend('Girdiğiniz kelimeler ile bir video bulunamadı', messageDeleteTime, message);
      return;
    }
    server.queue.url.push(result.first.url);
    server = await urlToInfo(server, result.first.url, message.member.user);
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
