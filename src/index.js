const Discord = require('discord.js')
//* Importing required 3th parti modules
const path          = require('path')
const wokcommands   = require('wokcommands')
const chalk         = require('chalk')
const Sentry        = require("@sentry/node");

//* Importing class & assets 
const database      = require('./Database')
const Guild         = require('./Class/guild')
const config        = require('./json/config.json')

//* Creating Client
const { Intents } = Discord

const Client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES] })

//* Importing .ENV
if (process.env.NODE_ENV == 'development ') {
    console.log(chalk.yellowBright('[ENV] Runing on development envirionment'))
    require('dotenv').config()
}

Sentry.init({
  dsn: process.env.SENTRY,
  tracesSampleRate: 1.0,
});

//* Login & creating WS connection to discord
Client.login(process.env.TOKEN)

//* Client on ready event
Client.on('ready', async () => {

    console.log(chalk.blueBright(`[Discord] Loged as ${Client.user.username}`))

    const db = new database.db(process.env.DB_URL, null, database.GuildSchema, () => {
        console.log(chalk.greenBright(`[Mongo] Connection made successfuly`))
    })

    Client.db = db
    var guildMap = new Map()

    Client.guilds.cache.each((guild) => {
        const G = new Guild(guild.id)
        G.Load(Client, config);
        guildMap.set(G.id, G)
    })
    
    Client.config = config
    Client.guildData = guildMap

    new wokcommands(Client, {
        ignoreBots: true,
        showWarns: false,
        delErrMsgCooldown: 4,
        testServers: '799780390046007296',
        botOwners: ['455831445949120535', '401824125506813962'],
        commandsDir: path.join(__dirname, 'Messages', 'Command'),
        featuresDir: path.join(__dirname, 'Messages', 'Features'),
        disabledDefaultCommands: ['help', 'command', 'language', 'prefix', 'requiredrole', 'channelonly'],
    })
        .setDefaultPrefix('-')
})