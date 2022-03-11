const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource, demuxProbe } = require('@discordjs/voice')
const embedEditor = require('../utils/DesignEmbed')
const SendDelete = require('../utils/Send&Delete')
const {exec: ytdl} = require('youtube-dl-exec')
const Sentry = require('@sentry/node');

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

    async play() {
        if (this.Songs.length > 0) {
            if (this.Songs[0]?.yur) {
                const audioResource = await this.#createAudioResource(this.Songs[0].yur)
                this.AudioPlayer.play(audioResource)
            } else if (this.Songs[0]?.sur) {
                let result = await this.Songs[0].convert()
                if (result == 200) {
                    const audioResource = await this.#createAudioResource(this.Songs[0].yur)
                    this.AudioPlayer.play(audioResource)
                } else {
                    SendDelete(`${this.Songs[0].title} Youtube'da bulunamadı`, this.guildData.channel, 3000, { type: 'embedError' }) 
                    this.AudioPlayer.emit(AudioPlayerStatus.Idle)
                }
            }
        }
    }

    async #createAudioResource(url) {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                url,
                {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100K',
                },
                { stdio: ['ignore', 'pipe', 'ignore'] },
            )

            if (!process.stdout) {
                reject(new Error('No stdout'))
                return
            }
            const stream = process.stdout
            const onError = (error) => {
                if (!process.killed) process.kill()
                stream.resume()
                reject(error)
            }
            process.once('spawn', () => {
                    demuxProbe(stream).then((prope) => {
                        const audioResource = createAudioResource(prope.stream, { metadata: this, inputType: prope.type })
                        resolve(audioResource)
                    }).catch(onError)
            }).catch(onError)
        })
    }

    connect(VoiceChannel) {
        if (!VoiceChannel.joinable) throw new Error('Client user is not able to connect to voice channel',)
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
            this.play()
        })
        this.AudioPlayer.on('error', (AudioError) => {
            Sentry.captureException(AudioError);
            SendDelete('Çalmaya çalışırken bir hata meydana geldi', this.guildData.channel, 2500, { type: 'embedError' })

            this.skip(true)
            this.play()
        })
    }


    quit(force) {
        if (!this.voiceConnection) return

        if (!force) {
            setTimeout(() => {
                if (this.Songs.length == 0) this.#q(true)
            }, 120000)
        } else if (force) {
            this.#q(!force)
        }
    }

    #q(send) {
        this.Songs = []
        this.channel = undefined
        this.AudioPlayer = undefined

        if (this.Subscription) {
            this.Subscription.unsubscribe()
            this.Subscription = undefined
        }
        
        try {
            this.voiceConnection.destroy()
        } catch(err){}
        this.voiceConnection = undefined
        
        this.guildData.DefaultEmbed()
        if (send) SendDelete('Kanaldan ayrıldım', this.guildData.channel, 2500, { type: 'embedInfo' })
    } 

    clear() {
        this.Songs = []
        this.AudioPlayer.stop(true)
        this.guildData.DefaultEmbed()
        SendDelete('Liste temizlendi', this.guildData.channel, 2500, { type: 'embedInfo' })

        this.quit()
    }

    skip(force) {
        if (!force) {
            switch (this.Loop) {
                case 'kapalı':
                    this.#skip()
                    break;
                case 'şarkı':
                    //* Nothing to do
                    break;
                case 'liste':
                    this.Songs.push(this.Songs[0])
                    this.Songs.shift()
                    break;
            }
        } else {
            this.#skip()
        }

    }

    #skip() {
        if (this.Songs.length != 0) {
            this.Songs.shift()
            if (this.Songs.length == 0) {
                this.AudioPlayer.stop(true)
                this.guildData.DefaultEmbed()
                this.Loop = 'kapalı'
                this.Pause = false
                this.quit()
            } else {
                this.AudioPlayer.stop(true)
            }
        }
    }

    loop() {
        switch (this.Loop) {
            case 'kapalı':
                this.Loop = 'şarkı'
                SendDelete('Çalan şarkı döngüye alındı', this.guildData.channel, 2500, { type: 'embedInfo' })
                break;
            case 'şarkı':
                this.Loop = 'liste'
                SendDelete('Liste döngüye alındı', this.guildData.channel, 2500, { type: 'embedInfo' })
                break;
            case 'liste':
                this.Loop = 'kapalı'
                SendDelete('Döngü kapandı', this.guildData.channel, 2500, { type: 'embedInfo' })
                break;
        }

        const embed = embedEditor(this)
        this.guildData.updateEmbed(embed)
    }

    paunp() {
        if (this.Pause) {
            this.AudioPlayer.unpause()
            this.Pause = false
            SendDelete('Çalmaya devam ediyor', this.guildData.channel, 2500, { type: 'embedInfo' })
        } else {
            this.AudioPlayer.pause(true)
            this.Pause = true
            SendDelete('Liste duraklatıldı', this.guildData.channel, 2500, { type: 'embedInfo' })
        }

        const embed = embedEditor(this)
        this.guildData.updateEmbed(embed)
    }

    shuffle() {
        if (this.Songs.length == 0) {
            SendDelete('Çalma listesinde hiç şarkı yok', this.guildData.channel, 2500, { type: 'embedWarning' })
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

        const embed = embedEditor(this)
        this.guildData.updateEmbed(embed)
        this.play()
        if (this.Pause) {
            this.AudioPlayer.pause(false);
        }
        SendDelete('Liste karıştırıldı', this.guildData.channel, 2500, { type: 'embedInfo' })
    }
}

module.exports = {
    SongPlayer
}
