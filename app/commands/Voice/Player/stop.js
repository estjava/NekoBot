const { t } = require('../../../utils/locale');

module.exports = {
    name: 'stop',
    description: 'Stop musik dan hapus queue',
    category: 'Voice',
    usage: '!stop',
    aliases: ['st'],
    examples: ['!stop'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.distube.getQueue(guildId);

        if (!queue) return message.reply(t(guildId, 'player.emptyQueue'));

        if (message.member.voice.channelId !== queue.voiceChannel.id) {
            return message.reply('❌ Kamu harus berada di voice channel yang sama dengan bot!');
        }

        const channelName = queue.voiceChannel.name;
        await queue.stop();

        message.reply({
            embeds: [{
                color: 0xff0000,
                title: '⏹️ Musik Dihentikan',
                description: t(guildId, 'player.stopSuccess') + `\nBot keluar dari **${channelName}**.`,
                timestamp: new Date()
            }]
        });
    }
};
