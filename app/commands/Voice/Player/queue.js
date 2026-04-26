const { t } = require('../../../utils/locale');

module.exports = {
    name: 'queue',
    description: 'Tampilkan antrian lagu',
    category: 'Voice',
    usage: '!queue [halaman]',
    aliases: ['q', 'antrian'],
    examples: ['!queue', '!queue 2'],
    execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.distube.getQueue(guildId);

        if (!queue || !queue.songs.length) {
            return message.reply(t(guildId, 'player.noQueue'));
        }

        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const totalPages = Math.ceil(queue.songs.length / perPage);
        const clampedPage = Math.max(1, Math.min(page, totalPages));
        const start = (clampedPage - 1) * perPage;

        const list = queue.songs.slice(start, start + perPage).map((s, i) => {
            const num = start + i + 1;
            const playing = num === 1 ? ' ▶️' : '';
            return t(guildId, 'player.queueEntry', {
                num: `${num}${playing}`,
                title: `[${s.name}](${s.url})`,
                duration: s.formattedDuration
            });
        }).join('\n');

        message.reply({
            embeds: [{
                color: 0x1db954,
                title: t(guildId, 'player.queueTitle'),
                description: list,
                fields: [
                    { name: '🎵 Sedang Diputar', value: `[${queue.songs[0].name}](${queue.songs[0].url})`, inline: true },
                    { name: '📊 Total', value: `${queue.songs.length} lagu`, inline: true },
                    { name: '⏸️ Status', value: queue.paused ? 'Paused' : 'Playing', inline: true }
                ],
                footer: {
                    text: t(guildId, 'player.queueFooter', {
                        count: queue.songs.length,
                        user: message.author.tag
                    }) + ` • Halaman ${clampedPage}/${totalPages}`
                },
                timestamp: new Date()
            }]
        });
    }
};
