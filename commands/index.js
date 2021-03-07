const setup = require('./setup')
const search = require('./videoSearch');
const help = require('./help');
const favorite = require('./favorite');
const update = require('./test')

module.exports = async (client) => {
  await setup(client)

  await search(client);

  await help(client);

  await favorite(client);

//  await update(client)

}
