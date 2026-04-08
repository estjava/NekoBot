module.exports = {
    name: 'mute',
    description: 'Mute bot',
    category: 'Music',
    usage: '!mute',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        queue.player.pause();
        message.reply('🔇 Bot di-mute!');
    }
};