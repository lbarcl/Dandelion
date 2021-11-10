const Suri = require('spotify-uri');
const axios = require('axios');

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
        console.log(this.Token);
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=${type}&limit=${limit}`, { headers: { Authorization: 'Bearer ' + this.Token } })
        return response.data.tracks.items
    }
}

module.exports = Spoti