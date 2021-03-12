const setup = require('./setup')
const search = require('./videoSearch');
const help = require('./help');
const favorite = require('./favorite');
const update = require('./update')
const lyrics = require('./lyric')
const support = require('./support')

module.exports = async (client) => {
  await setup(client)

  await search(client);

  await help(client);

  await favorite(client);

  await lyrics(client);

  await support(client);

  await update(client)

}
