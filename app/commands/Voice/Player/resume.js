const { t } = require('../../../utils/locale');

module.exports = {
    name: 'resume',
    description: 'Resume lagu yang di-pause',
    category: 'Voice',
    usage: '!resume',
    aliases: ['re', 'r'],
    examples: ['!resume'],
    execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.distube.getQueue(guildId);

        if (!queue) return message.reply(t(guildId, 'player.emptyQueue'));

        if (message.member.voice.channelId !== queue.voiceChannel.id) {
            return message.reply('❌ Kamu harus berada di voice channel yang sama dengan bot!');
        }

        if (!queue.paused) return message.reply('❌ Lagu sudah sedang berjalan!');

        queue.resume();
        message.reply({
            embeds: [{
                color: 0x00ff00,
                title: '▶️ Lagu Dilanjutkan',
                description: t(guildId, 'player.nowPlaying', { title: queue.songs[0].name }),
                timestamp: new Date()
            }]
        });
    }
};
