const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'leave',
    description: 'Bot keluar dari voice channel',
    category: 'Music',
    aliases: ['l', 'disconnect', 'dc'],
    usage: '!leave',
    execute(message, args, client) {
        const connection = getVoiceConnection(message.guild.id);
        
        if (!connection) {
            return message.reply('❌ Saya tidak ada di voice channel!');
        }

        // Clear queue
        const queue = client.queue.get(message.guild.id);
        if (queue) {
            queue.songs = [];
            client.queue.delete(message.guild.id);
        }

        connection.destroy();
        message.reply('👋 Keluar dari voice channel!');
    }
};