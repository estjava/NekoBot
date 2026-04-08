module.exports = {
    name: 'volume',
    description: 'Atur volume musik',
    category: 'Music',
    aliases: ['vol'],
    usage: '!volume <0-100>',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        if (!args.length) {
            return message.reply(`🔊 Volume saat ini: **${queue.volume}%**`);
        }

        const volume = parseInt(args[0]);
        
        if (isNaN(volume) || volume < 0 || volume > 100) {
            return message.reply('❌ Volume harus antara 0-100!');
        }

        queue.volume = volume;
        message.reply(`🔊 Volume diatur ke **${volume}%**`);
    }
};