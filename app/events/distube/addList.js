module.exports = {
    name: 'addList',
    execute(queue, playlist, client) {
        queue.textChannel?.send({
            embeds: [{
                color: 0x0099ff,
                title: '📋 Playlist Ditambahkan!',
                description: `**${playlist.name}** — ${playlist.songs.length} lagu`,
                timestamp: new Date()
            }]
        }).catch(() => {});
    }
};
