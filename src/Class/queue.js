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

        this.SongQue = []
        this.pause = false
        this.loop = false
    }

    play() {
        const audioResource = createAudioResource(ytdl(this.SongQue[0].url))
        this.AudioPlayer.play(audioResource)
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
            const embed = embedEditor(this.SongQue)
            this.guildData.updateEmbed(embed)
        })
        this.AudioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.skip()
        })
        this.AudioPlayer.on(AudioPlayerStatus.Error, () => {
            SendDelete('Çalmaya çalışırken bir hata meydana geldi', this.guildData.channel, 2500)
            this.skip()
        })
    }


    quit() {
        this.SongQue = []
        this.channel = undefined
        this.AudioPlayer = undefined

        this.Subscription = undefined
        this.Subscription.unsubscribe()

        this.voiceConnection.destroy()
        this.voiceConnection = undefined
    }

    clear() {
        this.SongQue = []
        this.AudioPlayer.stop(true)
        this.guildData.DefaultEmbed()

        setTimeout(() => {
            if (this.SongQue.length == 0) {
                this.quit()
            }
        }, 120000)
    }

    skip() {
        if (!this.loop) {
            this.SongQue.shift()
            if (this.SongQue.length == 0) {
                this.AudioPlayer.stop(true)
                this.guildData.DefaultEmbed()

                setTimeout(() => {
                    if (this.SongQue.length == 0) {
                        this.quit()
                    }
                }, 120000)
            } else {
                this.play()
            }
        } else {
            this.SongQue.push(this.SongQue[0])
            this.SongQue.shift()
            this.play()
        }
    }

    loop() {
        this.loop = !this.loop
    }

    pause() {
        if (this.pause) {
            this.AudioPlayer.unpause()
            this.pause = false
        } else {
            this.AudioPlayer.pause(true)
            this.pause = true
        }
    }

    shuffle() {
        if (this.SongQue.length == 0) {
            SendDelete('Çalma listesinde hiç şarkı yok', this.guildData.channel, 2500)
            return
        }

        var currentIndex = this.SongQue.length

        while (0 != currentIndex) {
            var randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1

            let temp = this.SongQue[currentIndex]
            this.SongQue[currentIndex] = this.SongQue[randomIndex]
            this.SongQue[randomIndex] = temp
        }

        const embed = embedEditor(this.SongQue)
        this.guildData.updateEmbed(embed)
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