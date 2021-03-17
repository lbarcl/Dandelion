const mongoose = require('mongoose');
const config = require('../config.json');
const url = config.mongo.url.test;

module.exports = async () => {
  await mongoose.connect(url, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return mongoose;
}
