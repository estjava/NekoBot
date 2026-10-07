import { EmbedBuilder, Message } from 'discord.js';
import { t } from '../../utils/locale';
import { getQueue } from '../../music/queue';
import { formatDuration } from '../../music/source';
import { say } from '../../music/guards';

const PAGE_SIZE = 10;

export default {
    name: 'Queue',
    description: 'Shows the music queue.',
    usage: ['!queue [page]'],
    aliases: ['q'],
    category: 'Voices',
    examples: ['!queue', '!queue 2'],

    async execute(message: Message, args: string[]) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = getQueue(gid);
        if (!queue || (!queue.current && !queue.tracks.length)) {
            return say(message, t(gid, queue ? 'player.emptyQueue' : 'player.noQueue'));
        }

        const pages = Math.max(1, Math.ceil(queue.tracks.length / PAGE_SIZE));
        const page = Math.min(Math.max(parseInt(args[0]) || 1, 1), pages);
        const start = (page - 1) * PAGE_SIZE;

        const upcoming = queue.tracks
            .slice(start, start + PAGE_SIZE)
            .map((tr, i) =>
                t(gid, 'player.queueEntry', { num: start + i + 1, title: tr.title, duration: formatDuration(tr.duration) })
            )
            .join('\n');

        const embed = new EmbedBuilder().setColor(0x5865F2).setTitle(t(gid, 'player.queueTitle'));
        if (queue.current) {
            embed.addFields({
                name: t(gid, 'player.nowPlayingTitle'),
                value: `${queue.current.title} (${formatDuration(queue.current.duration)})`,
            });
        }
        if (upcoming) embed.addFields({ name: t(gid, 'player.upNext'), value: upcoming });
        embed.setFooter({
            text:
                t(gid, 'player.queueFooter', { count: queue.tracks.length + (queue.current ? 1 : 0), user: queue.current?.requestedBy ?? '-' }) +
                ` • ${t(gid, 'player.queuePage', { page, pages })}` + (queue.loop !== 'off' ? ` • loop: ${queue.loop}` : ''),
        });
        return message.reply({ embeds: [embed] });
    },
};
