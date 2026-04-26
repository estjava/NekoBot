module.exports = {
    name: 'addSong',
    execute(queue, song, client) {
        queue.textChannel?.send({
            embeds: [{
                color: 0x0099ff,
                title: '➕ Ditambahkan ke Queue',
                description: `**[${song.name}](${song.url})**`,
                fields: [
                    { name: '⏱️ Durasi', value: song.formattedDuration || '?', inline: true },
                    { name: '📊 Posisi', value: `#${queue.songs.length}`, inline: true }
                ],
                thumbnail: { url: song.thumbnail || '' },
                timestamp: new Date()
            }]
        }).catch(() => {});
    }
};
