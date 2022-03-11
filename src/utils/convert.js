const axios = require('axios');
const TimeFixer = require('./TimeFixer');
const { tube } = require('../Class/youtube');
const { Song } = require('../Class/music');
const yt = new tube()

async function convert(track) {
    var data
    try {
        const response = await axios.get('https://kareoke.ga/v1/song/spotify?id=' + track?.id)
        data = new Song(response.data.youtube.url)
        data.id = response.data.youtube.id
        data.title = response.data.youtube.title
        data.image = track.image
        data.length = TimeFixer(response.data.spotify.length / 1000)
    } catch (err) {
        try {
            const result = await yt.SearchUf(`${track.artists[0].name} - ${track.name}`)
            data = new Song(result.url)
            data.id = result.id
            data.title = result.title
            data.image = result.bestThumbnail.url
            data.length = result.duration
        } catch (error) {
            data = 500
        }
    }

    return data
}

module.exports = convert
