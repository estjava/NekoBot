const { t, usageEmbed } = require('../../utils/locale');

module.exports = {
    name: 'join',
    description: 'Bot masuk ke voice channel',
    category: 'Voice',
    usage: '!join',
    aliases: ['j', 'connect'],
    examples: ['!join'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply(t(guildId, 'player.noVoiceChannel'));
        }

        const permissions = voiceChannel.permissionsFor(message.guild.members.me);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Bot tidak punya permission untuk join/speak di channel ini!');
        }

        const queue = client.distube.getQueue(guildId);
        if (queue) {
            return message.reply(`❌ Bot sudah berada di <#${queue.voiceChannel.id}>!`);
        }

        try {
            await client.distube.voices.join(voiceChannel);
            message.reply(`✅ Berhasil join **${voiceChannel.name}**!`);
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'common.error'));
        }
    }
};
