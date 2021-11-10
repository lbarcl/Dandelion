module.exports = async (content, channel, timeInterval) => {
    const message = await channel.send(content);

    setTimeout(() => { message.delete() }, timeInterval);
}