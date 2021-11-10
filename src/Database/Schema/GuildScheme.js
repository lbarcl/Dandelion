const { Schema, model } = require('mongoose')

const reqString = { type: String, required: true }

const requests = Schema({
    _id: String,
    Count: Number,
}, { timestamps: true })

const guilds = Schema({
    _id: reqString,
    channel: {
        id: reqString,
        message: {
            id: reqString,
            imageUrl: String,
            hexColor: String,
            description: String
        }
    }
})

module.exports = model('Guilds', guilds, 'Guilds')