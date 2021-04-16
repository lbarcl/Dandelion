const {embedEdit} = require('../../utils/API/messageWorks')

module.exports = (client) => {
    client.on("voiceStateUpdate", (newMember) => {
        if (!newMember.channelID) return
        if (client.users.cache.get(newMember.id).bot) return
        const {guild} = newMember
        if (!client.servers[guild.id]) return
        if (!client.servers[guild.id].queue.url[0]) return
        if (client.servers[guild.id].serverOut == 'kapalı') return
        if (!client.servers[guild.id].dispatcher) return
        if (client.servers[guild.id].dispatcher.player.voiceConnection.channel.id != newMember.channelID) return
    
        var queue = client.servers[guild.id].queue
        for(var i = 1; i < queue.url.length; i++){
            if (queue.requester[i] == newMember.id){   
                console.log(i)
                delete queue.url[i]     
                delete queue.title[i] 
                delete queue.time[i] 
                delete queue.image[i]  
                delete queue.requester[i]
            }
        }

        var newQueue = { url: [], title: [], time: [], image: [], requester: [], loop: 'kapalı'}
        for(var i = 0; i < queue.url.length; i++){
            if(queue.url[i] == undefined || queue.url[i] == null || queue.url[i] == '') continue
            newQueue.url.push(queue.url[i])
            newQueue.title.push(queue.title[i])        
            newQueue.time.push(queue.time[i])  
            newQueue.image.push(queue.image[i])  
            newQueue.requester.push(queue.requester[i])  
        }
        client.servers[guild.id].queue = newQueue
        embedEdit('playing', client.servers[guild.id], client.channels.cache.get(client.servers[guild.id].channelId))
    });
}