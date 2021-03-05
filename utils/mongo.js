const mongoose = require('mongoose');
const url = "mongodb+srv://Oblivion:gHzFVWnNlgLJx5Qv@jahardo.fuchd.mongodb.net/radio?retryWrites=true&w=majority";

module.exports = async () => {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose;
}
