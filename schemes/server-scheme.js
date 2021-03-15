const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const setup = mongoose.Schema({
  _id: reqString,
  channelId: reqString,
  messageId: reqString,
  serverList: [String],
  embedImageUrl: String
})

module.exports = mongoose.model('server-infos', setup)
