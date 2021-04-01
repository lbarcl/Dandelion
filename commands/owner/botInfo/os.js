const os = require('os');

module.exports = {
  name: 'sistem',
  aliases: ['os'],
  ownerOnly: true,
  minArgs: 0,
  hidden: true,
  description: 'Botun bulunduğu makine hakkında bilgi verir',
  syntaxError: "Yanlış kullanım, sadece `{PREFIX}os` yazmanız yeterli",
  callback: async ({ client }) => {
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
    console.log({
        cpu,
        totalRam: tram,
        freeRam: fram,
        ramUsing: uram
    })
  }
}
