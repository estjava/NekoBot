const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'stop',
    description: 'Stop musik dan clear queue',
    category: 'Music',
    usage: '!stop',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        queue.songs = [];
        queue.player.stop();
        
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
        }
        
        client.queue.delete(message.guild.id);
        message.reply('⏹️ Musik dihentikan dan queue dibersihkan!');
    }
};