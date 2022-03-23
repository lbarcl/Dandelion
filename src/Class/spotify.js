const Suri = require('spotify-uri');
const { Video } = require('./youtube')
const axios = require('axios');
const endPoint = 'https://api.spotify.com/v1'
const time = require('../utils/TimeFixer')
class Spoti {
    constructor(Client_ID, Client_SECRET) {
        this.Client_ID = Client_ID;
        this.Client_SECRET = Client_SECRET;

        this.Token = null;
    }

    async GetToken() {
        const response = await axios({
            url: 'https://accounts.spotify.com/api/token',
            method: 'post',
            params: {
                grant_type: 'client_credentials'
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: this.Client_ID,
                password: this.Client_SECRET
            }
        }).catch(err => { throw err })

        this.Token = response.data.access_token;
        return this.Token
    }

    async Search(query, options) {
        if (!query) throw new Error('You must enter a query string');
        const type = (!options?.type) ? 'track' : options.type;
        const limit = (!options?.limit) ? 5 : options.limit;

        await this.GetToken()
        const response = await axios.get(`${endPoint}/search?q=${encodeURI(query)}&type=${type}&limit=${limit}`, { headers: { Authorization: 'Bearer ' + this.Token } })
        
        if (response.data.tracks.items.length == 0) return 404
        
        return response.data.tracks.items.map(this.FormatTrack)
    }

    async GetPlaylist(id) {
        await this.GetToken()

        const headers = { headers: { Authorization: 'Bearer ' + this.Token, 'Content-Type': 'application/json' } }

        const mainResponse = await axios.get(`${endPoint}/playlists/${id}?fields=name,tracks(items,next)`, headers)
        var tracks = mainResponse.data.tracks.items
        var next = mainResponse.data.tracks.next


        while (next) {
            const response = await axios.get(next, headers)
            tracks = tracks.concat(response.data.items)
            next = response.data.next
        }

        return {
            id: id,
            url: 'https://open.spotify.com/playlist/' + id,
            uri: 'spotify:playlist:' + id,
            name: mainResponse.data.name,
            tracks: tracks.map((item) => {
                return this.FormatTrack(item.track)
            })
        }
    }

    async GetTrack(id) {
        await this.GetToken()
        const headers = { headers: { Authorization: 'Bearer ' + this.Token, 'Content-Type': 'application/json' } }

        const response = await axios.get(`${endPoint}/tracks/${id}`, headers)
        return this.FormatTrack(response.data)
    }

    async GetData(url) {
        var data = Suri(url)

        switch (data.type) {
            case 'track':
                const track = await this.GetTrack(data.id)
                data = {
                    type: 'track',
                    data: track
                }
                break;
            case 'playlist':

                const playlist = await this.GetPlaylist(data.id)
                data = {
                    type: 'playlist',
                    data: playlist
                }
                break;
        }

        return data
    }

    FormatTrack(track) {
        const T = new Track(track.external_urls.spotify) 
        T.sid = track.id
        T.title = track.name
        T.image = track.album.images[0].url
        T.durationMS = track.duration_ms
        T.duration = time(T.durationMS / 1000)

        return T
    }
}

class Track extends Video {
    constructor (url) {
        super(undefined)
        this.sid
        this.sur = url
    }

    async convert() {
        try {   
            const result = await axios.get(`https://kareoke.ga/v1/song/spotify?id=${this.sid}`)
            this.yid = result.data.youtube.id
            this.yur = result.data.youtube.url

            return 200
        } catch (err) {
            return 404
        }
    }
}

module.exports = Spoti