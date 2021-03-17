const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const videoSearch = mongoose.Schema({
  _id: reqString,
  keyWords: [String], 
  videoUrl: reqString
})

module.exports = mongoose.model('video-keywords', videoSearch)