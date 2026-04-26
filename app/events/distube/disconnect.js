module.exports = {
    name: 'disconnect',
    execute(queue, client) {
        queue.textChannel?.send('👋 Bot keluar dari voice channel.').catch(() => {});
    }
};
