const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const videoSearch = mongoose.Schema({
  _id: reqString,
  url: reqString,
  title: reqString,
  time: reqString,
  image: reqString,
  lastTime: Number,
  requestCounter: Number,
  keyWords: [String] 
})

module.exports = mongoose.model('video-infos', videoSearch)