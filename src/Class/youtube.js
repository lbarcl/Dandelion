const { YTSearcher } = require('ytsearcher');
const { Song } = require('./music');
const ytsr = require('ytsr');
const ytpl = require('ytpl');

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
        if (url.includes('/playlist')) {
            const result = await this.GetPlaylistUf(url)
            const items = result.items
            const songs = []

            for (let i = 0; i < items.length; i++) {
                const song = new Song(items[i].shortUrl)
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
            const song = new Song(url)
            await song.getData()
            song.requester = requester

            return {
                type: 'video',
                data: song
            }
        }
    }
}

module.exports = {
    tube,
    'pl': ytpl,
    'sr': ytsr,
    'searcher': YTSearcher
}
