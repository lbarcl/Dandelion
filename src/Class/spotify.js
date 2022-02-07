const Suri = require('spotify-uri');
const axios = require('axios');
const endPoint = 'https://api.spotify.com/v1'
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
        return response.data.tracks.items
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

        const data = {
            id: id,
            url: 'https://open.spotify.com/playlist/' + id,
            uri: 'spotify:playlist:' + id,
            name: mainResponse.data.name,
            tracks: tracks.map((item) => {
                return this.FormatTrack(item.track)
            })
        }

        return data

    }

    async GetTrack(id) {
        await this.GetToken()
        const headers = { headers: { Authorization: 'Bearer ' + this.Token, 'Content-Type': 'application/json' } }

        const response = await axios.get(`${endPoint}/tracks/${id}`, headers)
        const data = this.FormatTrack(response.data)

        return data
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
        return {
            id: track.id,
            name: track.name,
            image: track.album.images[0].url,
            artists: track.artists,
            explicit: track.explicit
        }
    }
}

module.exports = Spoti