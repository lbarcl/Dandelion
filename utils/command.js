const { prefix } = require('../config.json')

module.exports = (client, aliases, callback) =>{

if(typeof aliases === "string"){
  aliases = [aliases]
}

client.on('message', message => {
  const { content } = message;
  aliases.forEach(alias => {
    const command = `${prefix}${alias}`
    var con = content.toLowerCase();
    if (con.startsWith(`${command} `) || con === command){
       console.log(`running the command ${command} ` + message.author.username + ' ' + datetime())
       const text = content.replace(`${command} `, '');
       const args = text.split(' ');
       callback(message, args, text)
     }
   });

 })
}

function datetime() {
  var today = new Date();
  var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime;
 }
