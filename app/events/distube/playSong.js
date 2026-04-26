module.exports = {
    name: 'playSong',
    execute(queue, song, client) {
        queue.textChannel?.send({
            embeds: [{
                color: 0x1db954,
                title: '🎵 Sedang Memutar',
                description: `**[${song.name}](${song.url})**`,
                fields: [
                    { name: '👤 Artis', value: song.uploader?.name || 'Unknown', inline: true },
                    { name: '⏱️ Durasi', value: song.formattedDuration || '?', inline: true },
                    { name: '🔗 Source', value: song.source || 'youtube', inline: true },
                    { name: '📋 Ditambah oleh', value: song.member?.user.tag || 'Unknown', inline: true },
                    { name: '📊 Queue', value: `${queue.songs.length} lagu tersisa`, inline: true }
                ],
                thumbnail: { url: song.thumbnail || '' },
                timestamp: new Date()
            }]
        }).catch(() => {});
    }
};
