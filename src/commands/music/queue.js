const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'queue',
    description: 'Lihat daftar lagu di queue',
    category: 'Music',
    aliases: ['q', 'list'],
    usage: '!queue',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue || !queue.songs.length) {
            return message.reply('❌ Queue kosong!');
        }

        const current = queue.songs[0];
        const upcoming = queue.songs.slice(1, 11); // Max 10 songs

        const embed = new EmbedBuilder()
            .setColor('#FF1493')
            .setTitle('📜 Music Queue')
            .setDescription(`**Now Playing:**\n[${current.title}](${current.url}) - \`${current.duration}\``)
            .setThumbnail(current.thumbnail);

        if (upcoming.length > 0) {
            const queueList = upcoming.map((song, index) => 
                `**${index + 1}.** [${song.title}](${song.url}) - \`${song.duration}\``
            ).join('\n');
            
            embed.addFields({ name: 'Up Next:', value: queueList });
        }

        if (queue.songs.length > 11) {
            embed.setFooter({ text: `And ${queue.songs.length - 11} more...` });
        } else {
            embed.setFooter({ text: `Total ${queue.songs.length} song(s) in queue` });
        }

        message.reply({ embeds: [embed] });
    }
};