//* Importing required modules
const embedEditor = require('../../utils/DesignEmbed');
const SendDelete = require('../../utils/Send&Delete');
const { tube } = require('../../Class/youtube');
const queue = require('../../Class/queue');
const chalk = require('chalk');

//* Creating Regular exprenations for URIs
const regex = new RegExp("((http|https)://)(www.)?" +
    "[a-zA-Z0-9@:%._\\+~#?&//=]" +
    "{2,256}\\.[a-z]" +
    "{2,6}\\b([-a-zA-Z0-9@:%" +
    "._\\+~#?&//=]*)")

const yt = new tube(process.env.YT_API)

module.exports = (client, instance) => {
    //* Registering on message event 
    client.on('messageCreate', async message => {
        //* Getting guild data from cache
        const guildData = client.guildData.get(message.guild.id)

        //* Checking for is user able to use it
        if (message.author.id == client.user.id) return
        else if (!guildData?.channel) return
        else if (guildData?.channel.id != message.channel.id) return
        else if (message.content.slice(0, 1) == instance._defaultPrefix) {
            message.delete()
            message.author.send(`Lütfen ${client.config.embed.title} kanalında komut çalıştırmayın`);
            return
        }
        else if (message.author.bot) {
            message.delete()
            SendDelete('Lütfen bu kanalda diğer botları kullanmayın', message.channel, 2500, {type: 'embedWarning'});
            return
        }

        //* Deleting message after 250ms 
        setTimeout(() => {
            message.delete()
        }, 2500);

        GetData(guildData, message)

    });
}



async function GetData(guildData, message) {
    var isConnected = false
    if (guildData.player?.voiceConnection) {
        //? When bot is connected to a channel
        isConnected = true

        if (message.member.voice.channelId != guildData.player.channel.id) {
            //? When user is not in the same voice channel with the bot
            SendDelete(`Kullanabilmek için ${guildData.embed.title} ile aynı kanalda olmanız gerekiyor`, message.channel, 2500, {type: 'embedWarning'})
            return
        }
    } else if (!message.member.voice.channelId) {
        //? When bot is not connected to a channel and user is not connected to any voice channel
        SendDelete('Kullanabilmek için bir ses kanalında olmanız gerekiyor', message.channel, 2500, {type: 'embedWarning'})
        return
    }

    if (regex.test(message.content)) {
        //? If content is a URL

        if (message.content.includes('https://www.youtube.com')) {
            const result = await yt.getUrlData(message.content, message.author.id)

            if (result.type == 'playlist') {

                if (isConnected) {
                    if (guildData.player.Songs.length == 0) var flag = true

                    guildData.player.Songs = guildData.player.Songs.concat(result.data)

                    if (flag) guildData.player.play()
                    else guildData.updateEmbed(embedEditor(guildData.player))

                } else {
                    guildData.player = new queue.SongPlayer(guildData)
                    guildData.player.connect(message.member.voice.channel)
                    guildData.player.Songs = result.data

                    firePlayer(guildData)
                }
            } else if (result.type == 'video') {

                if (isConnected) {
                    if (guildData.player.Songs.length == 0) var flag = true

                    guildData.player.Songs.push(result.data)

                    if (flag) guildData.player.play()
                    else guildData.updateEmbed(embedEditor(guildData.player))
                } else {
                    guildData.player = new queue.SongPlayer(guildData)
                    guildData.player.connect(message.member.voice.channel)
                    guildData.player.Songs.push(result.data)

                    firePlayer(guildData)
                }
            }
        }

    } else {
        const result = await yt.SearchOf(message.content)
        const song = new queue.Song(result.url)
        await song.getData()
        song.requester = message.author.id

        if (isConnected) {
            if (guildData.player.Songs.length == 0) var flag = true

            guildData.player.Songs.push(song)

            if (flag) guildData.player.play()
            else guildData.updateEmbed(embedEditor(guildData.player))
        } else {
            guildData.player = new queue.SongPlayer(guildData)
            guildData.player.connect(message.member.voice.channel)
            guildData.player.Songs.push(song)

            firePlayer(guildData)
        }
    }
}

function firePlayer(guildData) {
    if (guildData.player.Songs.length >= 1) {
        console.log(chalk.hex('#C53D5C')(`[${guildData.embed.title}] Player started on ${guildData.id}`))
        guildData.player.StartPlayer()
    }
}