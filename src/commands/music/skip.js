module.exports = {
    name: 'skip',
    description: 'Skip lagu saat ini',
    category: 'Music',
    aliases: ['s', 'next'],
    usage: '!skip',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        if (!queue.songs.length) {
            return message.reply('❌ Tidak ada lagu di queue!');
        }

        queue.player.stop();
        message.reply('⏭️ Lagu di-skip!');
    }
};