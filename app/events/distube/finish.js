module.exports = {
    name: 'finish',
    execute(queue, client) {
        queue.textChannel?.send('✅ Queue sudah habis!').catch(() => {});
    }
};
