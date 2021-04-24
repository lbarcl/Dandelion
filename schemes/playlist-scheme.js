const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const playlist = mongoose.Schema({
  _id: reqString,
  info: {
    owner: reqString,
    title: reqString,
    type: reqString,
    description: String,
  },
  settings: {
    color: String,
    image: String,
    private: {
      type: Boolean,
      default: false
    }
  },
  items: [String]
})

module.exports = mongoose.model('playlists', playlist)