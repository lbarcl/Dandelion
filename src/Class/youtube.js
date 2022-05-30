const { YTSearcher } = require('ytsearcher');
const { getBasicInfo } = require('ytdl-core')
const Url = require('url-parse');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const time = require('../utils/TimeFixer')

class tube {
    constructor(key) {
        this.APIkey = key || null;
    }

    async SearchOf(query) {
        const searcher = new YTSearcher(this.APIkey);
        const result = await searcher.search(query, { type: 'video' });
        return result.first
    }

    async SearchUf(query) {
        var filters = await ytsr.getFilters(query);
        filters = filters.get('Type').get('Video');
        const result = await ytsr(filters.url, { pages: 1, limit: 3 });
        return result.items[0]
    }

    async GetPlaylistUf(url) {
        if (!ytpl.validateID(url)) throw new Error('Not a valid URI')

        const playlist = await ytpl(url, { limit: Infinity, gl: 'TR', hl: 'tr' })
        return playlist
    }

    async getUrlData(url, requester) {
        console.log("y")
        if (url.includes('/playlist')) {
            const result = await this.GetPlaylistUf(url)
            const items = result.items
            const songs = []

            for (let i = 0; i < items.length; i++) {
                const song = new Video(items[i].shortUrl)
                song.id = items[i].id
                song.title = items[i].title
                song.image = items[i].bestThumbnail.url
                song.length = items[i].duration
                song.requester = requester
                songs.push(song)
            }

            return {
                type: 'playlist',
                data: songs
            }
        } else if (url.includes('/watch')) {
            const song = new Video(url)
            await song.getData()
            song.requester = requester

            return {
                type: 'video',
                data: song
            }
        } else if (url.includes('/shorts')) {
            url = new Url(url)
            id = url.pathname.replace('/shorts/', '')
            url = "https://www.youtube.com/watch?v=" + id
            console.log(url)

        }
    }
}

class Video {
    constructor (url) {
        this.yid
        this.yur = url
        this.title
        this.image
        this.duration
        this.durationMS
        this.requester 
    }

    async getData() {
        const data = await getBasicInfo(this.yur)

        this.yid = data.videoDetails.videoId
        this.title = data.videoDetails.title
        this.image = data.videoDetails.thumbnails[data.videoDetails.thumbnails.length - 1].url
        this.durationMS = parseInt(data.videoDetails.lengthSeconds) * 1000
        this.duration = time(this.durationMS / 1000)

        return this.ConvertJSON()
    }

    ConvertJSON() {
        return JSON.stringify(this)
    }
}

module.exports = {
    tube,
    'pl': ytpl,
    'sr': ytsr,
    Video,
    'searcher': YTSearcher
}
