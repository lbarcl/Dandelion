const mongoose = require('mongoose');
const config = require('../config.json');
const url = config.url;

module.exports = async () => {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose;
}
