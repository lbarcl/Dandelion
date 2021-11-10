const { YTSearcher } = require('ytsearcher')
const ytsr = require('ytsr');
const ytpl = require('ytpl');

class tube {
    constructor (key) {
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
        const result = await ytsr(filters.url, { pages: 1 });
        return result.items[0]
    }

    async GetPlaylistUf(url) {
        if (!ytpl.validateID(url)) throw new Error('Not a valid URI')

        const playlist = await ytpl(url, { limit: Infinity, gl: 'TR', hl: 'tr' })
        return playlist
    }
}

module.exports = {
    tube,
    'pl': ytpl,
    'sr': ytsr,
    'searcher': YTSearcher
}
