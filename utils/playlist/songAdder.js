const { videoFind } = require('../database/info')
const config = require('../../config.json');
//--------------------------Youtube-----------------------------------
const ytdl = require('ytdl-core')
const ytpl = require('ytpl');
//--------------------------Spotify-----------------------------------
const spotifyUri = require('spotify-uri')
const spotify = require('../API/spotify')

module.exports = async (messageContent) => {
    var urls = []
    if (messageContent.includes('spotify')) {
        const uriResponse = spotifyUri.parse(messageContent)
        // Spotify playlist ekleme
        if (uriResponse.type == 'playlist') {
            const sresult = await spotify.getPlaylist(uriResponse.id, config.api.spotify.client.id, config.api.spotify.client.secret)
            const list = sresult.tracks.items
            for (var i = 0; i < list.length; i++) {
                try {
                    const searchString = list[i].track.artists[0].name + ' - ' + list[i].track.name
                    let result = await videoFind(searchString)
                    urls.push(result)
                    console.log(result)
                } catch (err) {
                    console.error(err)
                }
            }
            console.log(urls)
        } // Spotify şarkı ekleme
        else if (uriResponse.type == 'track') {
            const track = await spotify.getTrack(uriResponse.id, config.api.spotify.client.id, config.api.spotify.client.secret)
            const searchString = track.artists[0].name + ' - ' + track.name
            try {
                let result = await videoFind(searchString)
                urls = result
            } catch (err) {
                console.error(err)
            }
        }
    } // Youtube playlist ekleme
    else if (ytpl.validateID(messageContent)) {
        const playList = await ytpl(messageContent, { limit: Infinity })
        for (var i = 0; i < playList.items.length; i++) {
            urls.push(playList[i])
        }
    } // Youtube URL ekleme
    else if (ytdl.validateURL(messageContent)) {
        urls = messageContent
    } // kelimeden araştırıp ekleme
    else {
        let result = await videoFind(messageContent)
        if (ytdl.validateURL(result)) {
            urls = result
        }
    }

    return urls
}