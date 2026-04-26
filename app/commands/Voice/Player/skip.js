const { t } = require('../../../utils/locale');

module.exports = {
    name: 'skip',
    description: 'Skip lagu yang sedang diputar',
    category: 'Voice',
    usage: '!skip',
    aliases: ['s', 'next'],
    examples: ['!skip'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.distube.getQueue(guildId);

        if (!queue) return message.reply(t(guildId, 'player.emptyQueue'));

        if (message.member.voice.channelId !== queue.voiceChannel.id) {
            return message.reply('❌ Kamu harus berada di voice channel yang sama dengan bot!');
        }

        if (queue.songs.length <= 1) {
            await queue.stop();
            return message.reply(t(guildId, 'player.skipSuccess') + ' Queue sudah habis!');
        }

        const skipped = queue.songs[0].name;
        const next = queue.songs[1]?.name || '-';
        await queue.skip();

        message.reply({
            embeds: [{
                color: 0x0099ff,
                title: t(guildId, 'player.skipSuccess'),
                description: `**${skipped}** di-skip.\n${t(guildId, 'player.nowPlaying', { title: next })}`,
                timestamp: new Date()
            }]
        });
    }
};
