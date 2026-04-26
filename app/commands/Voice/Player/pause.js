const { t } = require('../../../utils/locale');

module.exports = {
    name: 'pause',
    description: 'Pause lagu yang sedang diputar',
    category: 'Voice',
    usage: '!pause',
    aliases: ['pa'],
    examples: ['!pause'],
    execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.distube.getQueue(guildId);

        if (!queue) return message.reply(t(guildId, 'player.emptyQueue'));

        if (message.member.voice.channelId !== queue.voiceChannel.id) {
            return message.reply('❌ Kamu harus berada di voice channel yang sama dengan bot!');
        }

        if (queue.paused) return message.reply('❌ Lagu sudah dalam kondisi pause!');

        queue.pause();
        message.reply({
            embeds: [{
                color: 0xffcc00,
                title: '⏸️ ' + t(guildId, 'player.nowPlaying').replace('🎶 ', '').replace(': **{title}**', ''),
                description: `**${queue.songs[0].name}** di-pause.\nGunakan \`${client.prefixes.get(guildId) || client.config.prefix}resume\` untuk melanjutkan.`,
                timestamp: new Date()
            }]
        });
    }
};
