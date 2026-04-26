const { t, usageEmbed } = require('../../../utils/locale');

module.exports = {
    name: 'play',
    description: 'Putar lagu dari YouTube, Spotify, atau SoundCloud',
    category: 'Voice',
    usage: '!play <url atau judul lagu>',
    aliases: ['putar'],
    examples: [
        '!play Never Gonna Give You Up',
        '!play https://youtube.com/watch?v=...',
        '!play https://open.spotify.com/track/...',
        '!play https://soundcloud.com/...'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;

        if (!args.length) {
            return message.reply({
                content: '❌ Masukkan URL atau judul lagu!',
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply(t(guildId, 'player.noVoiceChannel'));
        }

        const permissions = voiceChannel.permissionsFor(message.guild.members.me);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Bot tidak punya permission untuk join/speak di channel ini!');
        }

        const queue = client.distube.getQueue(guildId);
        if (queue && message.member.voice.channelId !== queue.voiceChannel.id) {
            return message.reply('❌ Kamu harus berada di voice channel yang sama dengan bot!');
        }

        const query = args.join(' ');

        try {
            await client.distube.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'player.playError'));
        }
    }
};
