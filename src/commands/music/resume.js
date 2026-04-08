module.exports = {
    name: 'resume',
    description: 'Resume musik yang di-pause',
    category: 'Music',
    aliases: ['unpause'],
    usage: '!resume',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        if (queue.playing) {
            return message.reply('▶️ Musik tidak di-pause!');
        }

        queue.player.unpause();
        queue.playing = true;
        message.reply('▶️ Musik dilanjutkan!');
    }
};