const axios = require('axios')

class getData {
    constructor(client) {
        this.Client = client
    }

    async fromMessage(message) {
        const { content, author } = message
        const regex = new RegExp("((http|https)://)(www.)?" +
            "[a-zA-Z0-9@:%._\\+~#?&//=]" +
            "{2,256}\\.[a-z]" +
            "{2,6}\\b([-a-zA-Z0-9@:%" +
            "._\\+~#?&//=]*)")
        const Songs = []
        var type;
        if (content.startsWith('+')) {
            if (content.toLowerCase().startsWith('+r')) {
                //* Get random song from kareoke
                const { data } = await axios.get('https://kareoke.ga/v1/song/random')
                //* Create video instance from youtube url
                const song = new this.Client.Video(data.youtube.url)
                //* Get video data from youtube
                await song.getData()
                song.requester = author.id 
                //* Add video to list
                Songs.push(song)
                type = 'video'
            } else if (content.toLowerCase().startsWith('+yt')) {
                const query = content.slice(3).trim()
                const result = await this.Client.youtube.SearchUf(query)
                if (!result?.url) {
                    throw new Error(`\`${message.content.slice(3).trim()}\` YouTubeda bulunamadı`)
                }
                const video = new this.Client.Video(result.url)
                await video.getData()
                video.requester = author.id
                Songs.push(video)
                type = 'video'
            }
        } else if (regex.test(content)) {
            if (content.includes('https://open.spotify.com')) {
                const result = await this.Client.spotify.GetData(content)

                switch (result.type) {
                    case 'playlist':
                        for (let t in result.data.tracks) {
                            result.data.tracks[t].requester = author.id
                            Songs.push(result.data.tracks[t])
                            type = 'spotify.playlist'
                        }
                        break;
                    case 'track':
                        result.data.requester = author.id
                        Songs.push(result.data)
                        type = 'spotify.track'
                        break;
                } 
            }
            else if (content.includes('https://www.youtube.com')) {
                const result = await this.Client.youtube.getUrlData(content, author.id)

                switch (result.type) {
                    case 'playlist':
                        Songs.concat(result.data)
                        type = 'youtube.playlist'
                        break;
                    case 'video':
                        Songs.push(result.data)
                        type = 'youtube.video'
                        break;
                }

            }
        } else {
            const song = await this.Client.spotify.Search(content)

            if (song == 404) {
                throw new Error(`\`${message.content.trim()}\` Spotify bulunamadı`)
            }
            song[0].requester = author.id
            Songs.push(song[0])
            type = 'spotify.search'
        }

        return {Songs, type}
    }
}

module.exports = getData
