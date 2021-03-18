const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const playlist = mongoose.Schema({
  _id: reqString,
  ownerId: reqString,
  title: reqString,
  list: [String],
  description: String,
  image: String,
  color: String,
})

module.exports = mongoose.model('playlists', playlist)