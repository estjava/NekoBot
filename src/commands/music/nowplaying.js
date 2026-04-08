const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nowplaying',
    description: 'Tampilkan lagu yang sedang diputar',
    category: 'Music',
    aliases: ['np', 'current'],
    usage: '!nowplaying',
    execute(message, args, client) {
        const queue = client.queue.get(message.guild.id);
        
        if (!queue || !queue.songs.length) {
            return message.reply('❌ Tidak ada musik yang sedang diputar!');
        }

        const song = queue.songs[0];
        
        const embed = new EmbedBuilder()
            .setColor('#FF1493')
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${song.title}](${song.url})**`)
            .addFields(
                { name: '👤 Channel', value: song.author, inline: true },
                { name: '⏱️ Duration', value: song.duration, inline: true },
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔁 Loop', value: queue.loop ? 'ON' : 'OFF', inline: true },
                { name: '📊 Queue', value: `${queue.songs.length} song(s)`, inline: true }
            )
            .setThumbnail(song.thumbnail)
            .setFooter({ text: `Requested by ${song.requester.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};