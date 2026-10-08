import { EmbedBuilder, Message } from 'discord.js';
import { t } from '../../utils/locale';
import { getQueue } from '../../music/queue';
import { formatDuration } from '../../music/source';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'NowPlaying',
    description: 'Shows the song that is currently playing.',
    usage: ['!nowplaying'],
    aliases: ['np'],
    category: 'Voices',
    examples: ['!np'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const cur = getQueue(gid)?.current;
        if (!cur) return say(message, t(gid, 'player.nothingPlaying'), COLORS.error);
        const q = getQueue(gid)!;
        const embed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(t(gid, 'player.nowPlayingTitle'))
            .setURL(cur.url)
            .setDescription(
                t(gid, 'player.nowPlayingInfo', {
                    title: cur.title,
                    duration: formatDuration(cur.duration),
                    user: cur.requestedBy,
                    status: t(gid, q.isPaused ? 'player.statusPaused' : 'player.statusPlaying'),
                })
            );
        return message.reply({ embeds: [embed] });
    },
};
