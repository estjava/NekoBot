const { t } = require('../../utils/locale');

module.exports = {
    name: 'leave',
    description: 'Bot keluar dari voice channel',
    category: 'Voice',
    usage: '!leave',
    aliases: ['disconnect', 'dc'],
    examples: ['!leave'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.distube.getQueue(guildId);
        const voiceState = message.guild.members.me.voice;

        if (!voiceState?.channel) {
            return message.reply('❌ Bot tidak sedang berada di voice channel!');
        }

        if (message.member.voice.channelId !== voiceState.channel.id) {
            return message.reply('❌ Kamu harus berada di voice channel yang sama dengan bot!');
        }

        const channelName = voiceState.channel.name;
        if (queue) await queue.stop();
        await client.distube.voices.leave(message.guild);

        message.reply(`👋 Bot keluar dari **${channelName}**.`);
    }
};
