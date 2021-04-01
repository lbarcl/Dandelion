const express = require('express')
const app = express()
const port = 1250
const os = require('os');


app.listen(port, () => console.log(`Port ${port} dinleniyor`))

app.get('/servers/:id', (req, res) => {
    var server = client.servers[req.params.id]
    if (!server) res.sendStatus(404)
    else {
        res.send({
            channel: {
                id: server.channelId,
                message: {
                    id: server.messageId,
                    content: server.embedInfo
                }
            },
            queue: server.queue
        })
    }
})
app.get('/os', (req, res) => {
    var cpus = os.cpus()
    var tram = parseInt(os.totalmem() / 1000000000)
    var fram = parseInt(os.freemem() / 1000000000)
    var uram = tram - fram
    var cpu = {model: cpus[0].model, frequency: cpus[0].speed / 1000, cores: cpus.length, avgTimes: {user: 0, nice: 0, sys: 0, idle: 0, irq: 0}}
    for(var i = 0; i < cpus.length; i++){
        cpu.avgTimes.user += cpus[i].times.user
        cpu.avgTimes.nice += cpus[i].times.nice
        cpu.avgTimes.sys += cpus[i].times.sys
        cpu.avgTimes.idle += cpus[i].times.idle
        cpu.avgTimes.irq += cpus[i].times.irq
    }
    
    cpu.avgTimes.user /= cpus.length
    cpu.avgTimes.nice /= cpus.length
    cpu.avgTimes.sys /= cpus.length
    cpu.avgTimes.idle /= cpus.length
    cpu.avgTimes.irq /= cpus.length 
    res.send({
        cpu,
        totalRam: tram,
        freeRam: fram,
        ramUsing: uram
    })
})
app.get('/servers', (req, res) => {
    var servers = []
    client.guilds.cache.forEach(guild => {
        servers.push({"id": guild.id, "name": guild.name})
    })
    res.send(servers)
})
