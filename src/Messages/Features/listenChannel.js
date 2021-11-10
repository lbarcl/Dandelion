//* Importing required modules
const embedEditor = require('../../utils/DesignEmbed');
const SendDelete = require('../../utils/Send&Delete');
const queue = require('../../Class/queue');

//* Creating Regular exprenations for URIs
const regex = new RegExp("((http|https)://)(www.)?" +
    "[a-zA-Z0-9@:%._\\+~#?&//=]" +
    "{2,256}\\.[a-z]" +
    "{2,6}\\b([-a-zA-Z0-9@:%" +
    "._\\+~#?&//=]*)")

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
            SendDelete('Lütfen bu kanalda diğer botları kullanmayın', message.channel, 2500);
            return
        }

        //* Deleting message after 250ms 
        setTimeout(() => {
            message.delete()
        }, 250);


        if (!guildData.player?.voiceConnection) {

            if (!message.member.voice.channel) {
                SendDelete('Kullanabilmek için ses kanalında olmanız gerekiyor', message.channel, 2500);
                return
            }

            guildData.player = new queue.SongPlayer(guildData)
            guildData.player.connect(message.member.voice.channel)

            if (regex.test(message.content)) {
                //? TO-DO This place is going to check for incoming data
                if (message.content.includes('https://www.youtube.com')) {
                    const song = new queue.Song(message.content)
                    await song.getData()
                    guildData.player.SongQue.push(song)

                    firePlayer(guildData)
                } else {
                    SendDelete('Şuan diğer yöntemleri kullanamıyoruz, bir kaç güne gelicek', message.channel, 2500);
                    return
                }
            }


        } else {

            if (message.member.voice.channel.id != guildData.player.channel.id) {
                SendDelete('Kullanabilmek için aynı ses kanalında olmanız gerekiyor', message.channel, 2500);
                return
            }

            if (regex.test(message.content)) {
                //? TO-DO This place is going to check for incoming data
                if (message.content.includes('https://www.youtube.com')) {
                    const song = new queue.Song(message.content)
                    await song.getData()
                    guildData.player.SongQue.push(song)

                    if (guildData.player.SongQue.length == 1) {
                        guildData.player.play()
                    } else {
                        const embed = embedEditor(guildData.player.SongQue)
                        guildData.updateEmbed(embed)
                    }
                } else {
                    SendDelete('Şuan diğer yöntemleri kullanamıyoruz, bir kaç güne gelicek', message.channel, 2500);
                    return
                }
            }

        }
    });
}

function firePlayer(guildData) {
    if (guildData.player.SongQue.length == 1) {
        console.log('Starting Player')
        guildData.player.StartPlayer()
    }
}