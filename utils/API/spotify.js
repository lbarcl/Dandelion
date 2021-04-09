const axios = require('axios');

module.exports = { auth, getPlaylist, getTrack }

/**
 * Spotify api kullanmak için server side giriş
 * @param {string} clientId - Spotify client ID
 * @param {string} clientSecret - Spotify client Secret key 
 * @return {object} Yetkilendirme bitimine kalan süre, yetkilendirme türü ve giriş kodu döndürür
 */
async function auth(clientId, clientSecret){
  const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
          grant_type: 'client_credentials'
      },
      headers: {
        'Accept':'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: clientId,
        password: clientSecret
      }
  })
  return response.data
}

/**
 * Spotify api kullanarak playlist bilgileri verir
 * @param {string} spotifyId - Spotify playlist ID
 * @param {string} clientId - Spotify client ID
 * @param {string} clientSecret - Spotify client Secret key 
 * @return {object} Playlist sahibi bilgileri, playlist içeriği ve bilgileri
 */
async function getPlaylist(spotifyId, clientId, clientSecret){
  var items = {}
  const auth_result = await auth(clientId, clientSecret)
  var response = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyId}`, {
    headers: {
      'Accept': 'application/json', 
      'Content-Type': 'application/json', 
      'Authorization': `${auth_result.token_type} ${auth_result.access_token}` 
    },
  })
  items = response.data.tracks.items
  if (response.data.tracks.next){
    var nextUrl = response.data.tracks.next
    var repeate = response.data.tracks.total / 100
    if (!Number.isInteger(repeate)){
      if ((repeate - parseInt(repeate)) > 0){
        repeate ++
      }
    }
    for (var i = 0; i < repeate; i++){
      var nextTracks = await nextRequest(nextUrl, auth_result)
      for(var a = 0; a < nextTracks.data.items.length; a++){
        items.push(nextTracks.data.items[a])
      }
      if(nextTracks.data.next) nextUrl = nextTracks.data.next
      else break 
    }
  }
  
  response.data.tracks.items = items
  response.data.tracks.total = items.length
  return response?.data
}

async function nextRequest(next, auth){
  return await axios.get(next, {
    headers: {
      'Accept': 'application/json', 
      'Content-Type': 'application/json', 
      'Authorization': `${auth.token_type} ${auth.access_token}` 
    }
  })
}

/**
 * Spotify api kullanarak track bilgileri verir
 * @param {string} spotifyId - Spotify track ID
 * @param {string} clientId - Spotify client ID
 * @param {string} clientSecret - Spotify client Secret key 
 * @return {object} Artist ve track bilgileri
 */
async function getTrack(spotifyId, clientId, clientSecret){
  const auth_result = await auth(clientId, clientSecret)
  const result = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
    headers: {
      'Accept': 'application/json', 
      'Content-Type': 'application/json', 
      'Authorization': `${auth_result.token_type} ${auth_result.access_token}` 
    },
  })
  return result?.data
}