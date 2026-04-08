module.exports = {
    name: 'pause',
    description: 'Pause musik yang sedang diputar',
    category: 'Music',
    usage: '!pause',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        if (!queue.playing) {
            return message.reply('⏸️ Musik sudah di-pause!');
        }

        queue.player.pause();
        queue.playing = false;
        message.reply('⏸️ Musik di-pause!');
    }
};