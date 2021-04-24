const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true
}

const setup = mongoose.Schema({
  _id: reqString,
  channel: {
    id: reqString,
    message: {
      id: reqString,
      imageUrl: String,
      hexColor: String,
      description: String
    }
  },
  settings: {
    serverOut: String,
  }
})

module.exports = mongoose.model('server-infos', setup)
