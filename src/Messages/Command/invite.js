module.exports = {
    name: 'davet',
    category: 'User',
    aliases: ['davet', 'd'],

    minArgs: 0,
    guildOnly: false,

    description: 'Dandelion davet linki atar',
    syntaxError: 'Yanlış kullanım, sadece "{PREFIX}"davet yazmanız yeterli',
    callback: ({message}) => {
        message.channel.send('https://discord.com/api/oauth2/authorize?client_id=797537793689124894&permissions=3238992&scope=bot')        
      }
    }
