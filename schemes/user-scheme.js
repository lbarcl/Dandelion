const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const favs = mongoose.Schema({
  _id: reqString,
  favoriteSongs: [String]
})

module.exports = mongoose.model('user-infos', favs)