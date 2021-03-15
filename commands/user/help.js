const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'yardım',
    aliases: ['yardım', 'y'],
    maxArgs: 1,
    syntaxError: "Yanlış kullanım, sadece `{PREFIX}yardım (isteğe bağlı [komut-ismi])` yazmanız yeterli",
    callback: async ({ message, client, args, instance }) => {
        if(!args[0]){
          const helpEmbed = new MessageEmbed()
          .setTitle('Yardım')
          .setColor(client.config.embed.color)
          .setAuthor(message.member.nickname || message.member.user.username, message.member.user.avatarURL())
          .setDescription(`Komutlar hakında daha fazla bilgi almak için  ${client.config.prefix}yardım <komut ismi>`)
          instance.commandHandler.commands.forEach((command) => {
            var description = command.description || 'Açıklama yakında eklenecek';
            helpEmbed.addField(`${command.names[0]}`, description, true)
          })
          message.channel.send(helpEmbed);
          return;
        }
    
        var command = '';
        instance.commandHandler.commands.forEach(com => {
          com.names.forEach(name => {
            if(name === args[0]){
              command = com;
              return;
            }
          })
        });
        var syntax = command.syntax || `${client.config.prefix}${command.names[0]}`
        var description = command.description || 'Açıklama yakında eklenecek';
        var allies = command.names.join(' | ');
        const helpEmbed = new MessageEmbed()
        .setTitle(command.names[0])
        .setColor(client.config.embed.color)
        .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL())
        .setDescription(description)
        .addField('Sözdizimi', syntax, true)
        .addField('Diğer çağırma yöntemleri', allies)
        
        message.channel.send(helpEmbed);
    }
}