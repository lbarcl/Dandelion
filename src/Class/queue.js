const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource } = require('@discordjs/voice')
const embedEditor = require('../utils/DesignEmbed')
const SendDelete = require('../utils/Send&Delete')
const time = require('../utils/TimeFixer')
const ytdl = require('ytdl-core')

class SongPlayer {
    constructor(guildData) {
        this.guildData = guildData
        
        this.VoiceConnection
        this.AudioPlayer
        this.channel

        this.Songs = []
        this.Pause = false
        this.Loop = 'kapalı'
    }

    play() {
        try {
            const audioResource = createAudioResource(ytdl(this.Songs[0].url, {quality: 'highestaudio', filter: 'audioonly'}))
            this.AudioPlayer.play(audioResource)
        } catch (err) {
            this.skip()
        }
    }

    connect(VoiceChannel) {
        if (!VoiceChannel.joinable) throw new Error('Client user is not able to connect')
        this.voiceConnection = joinVoiceChannel({
            channelId: VoiceChannel.id,
            guildId: VoiceChannel.guildId,
            adapterCreator: VoiceChannel.guild.voiceAdapterCreator
        })
        this.channel = VoiceChannel
    }

    StartPlayer() {
        this.AudioPlayer = createAudioPlayer()
        this.Subscription = this.voiceConnection.subscribe(this.AudioPlayer)

        this.play()

        this.AudioPlayer.on(AudioPlayerStatus.Playing, () => {
            const embed = embedEditor(this)
            this.guildData.updateEmbed(embed)
        })
        this.AudioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.skip()
        })
        this.AudioPlayer.on('error', () => {
            SendDelete('Çalmaya çalışırken bir hata meydana geldi', this.guildData.channel, 2500)
            if (this.Songs.length >= 1) {
                this.Songs.shift()
                if (this.Songs.length == 0) {
                    this.guildData.DefaultEmbed()
                    this.AudioPlayer.stop(true)

                    setTimeout(() => {
                        if (this.Songs.length == 0) {
                            this.quit()
                        }
                    }, 120000)
                } else {
                    this.play()
                }
            }
        })
    }


    quit() {
        this.Songs = []
        this.channel = undefined
        this.AudioPlayer = undefined

        this.Subscription.unsubscribe()
        this.Subscription = undefined

        this.voiceConnection.destroy()
        this.voiceConnection = undefined
        this.guildData.DefaultEmbed()
    }

    clear() {
        this.Songs = []
        this.AudioPlayer.stop(true)
        this.guildData.DefaultEmbed()

        setTimeout(() => {
            if (this.Songs.length == 0) {
                this.quit()
            }
        }, 120000)
    }

    skip() {
        if (this.Loop == 'kapalı') {
            this.Songs.shift()
            if (this.Songs.length == 0) {
                this.AudioPlayer.stop(true)
                this.guildData.DefaultEmbed()

                setTimeout(() => {
                    if (this.Songs.length == 0) {
                        this.quit()
                    }
                }, 120000)
            } else if (this.Songs.length >= 1) {
                this.play()
            }

        } else if (this.Loop == 'şarkı') {
            this.play()
        } else if (this.Loop == 'liste'){
            this.Songs.push(this.Songs[0])
            this.Songs.shift()
            this.play()
        }
    }

    async loop() {
        switch (this.Loop) {
            case 'kapalı':
                this.Loop = 'şarkı'
                break;
            case 'şarkı':
                this.Loop = 'liste'
                break;
            case 'liste':
                this.Loop = 'kapalı'
                break;
        }

        const embed = embedEditor(this)
        this.guildData.updateEmbed(embed)
    }

    paunp() {
        if (this.Pause) {
            this.AudioPlayer.unpause()
            this.Pause = false
        } else {
            this.AudioPlayer.pause(true)
            this.Pause = true
        }

        const embed = embedEditor(this)
        this.guildData.updateEmbed(embed)
    }

    shuffle() {
        if (this.Songs.length == 0) {
            SendDelete('Çalma listesinde hiç şarkı yok', this.guildData.channel, 2500)
            return
        }

        var currentIndex = this.Songs.length

        while (0 != currentIndex) {
            var randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1

            let temp = this.Songs[currentIndex]
            this.Songs[currentIndex] = this.Songs[randomIndex]
            this.Songs[randomIndex] = temp
        }

        this.play()
    }
}

class Song {
    constructor(url) {
        this.id
        this.url = url
        this.title
        this.image
        this.length
        this.requester
    }

    async getData() {
        const data = await ytdl.getBasicInfo(this.url)

        this.id = data.videoDetails.videoId
        this.title = data.videoDetails.title
        this.image = data.videoDetails.thumbnails[data.videoDetails.thumbnails.length - 1].url
        this.length = time(parseInt(data.videoDetails.lengthSeconds))
    }

    ConvertJSON() {
        return JSON.stringify(this)
    }
}

module.exports = {
    SongPlayer,
    Song
}