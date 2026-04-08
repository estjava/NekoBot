module.exports = {
    name: 'unmute',
    description: 'Unmute bot',
    category: 'Music',
    usage: '!unmute',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        queue.player.unpause();
        message.reply('🔊 Bot di-unmute!');
    }
};