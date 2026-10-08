import { Message, Client } from 'discord.js';
import { t } from '../../utils/locale';
import { createQueue, getQueue } from '../../music/queue';
import { SourceError, formatDuration, resolve } from '../../music/source';
import { ensureVoice, getPrefix } from '../../music/guards';
import { COLORS, descEmbed, say } from '../../utils/embedBuilder';

export default {
    name: 'Play',
    description: 'Plays a song (name or URL) or adds it to the queue.',
    usage: ['!play <song name or URL> [--playlist]'],
    aliases: ['p'],
    category: 'Voices',
    examples: ['!play never gonna give you up', '!play https://www.youtube.com/watch?v=...'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        // `--playlist` (or -pl / --mix) loads the whole list of a link that also points at a single video
        const FLAGS = ['--playlist', '--mix', '-pl'];
        const forcePlaylist = args.some((a) => FLAGS.includes(a.toLowerCase()));
        const query = args.filter((a) => !FLAGS.includes(a.toLowerCase())).join(' ').trim();
        if (!query) return say(message, t(gid, 'player.playUsage', { prefix: getPrefix(client, gid) }), COLORS.error);

        const voice = await ensureVoice(message);
        if (!voice) return;

        // If the bot is already busy in another channel, don't hijack it.
        let queue = getQueue(gid);
        const botChannelId = message.guild.members.me?.voice.channelId;
        if (queue && botChannelId && botChannelId !== voice.id && (queue.current || queue.tracks.length)) {
            return say(message, t(gid, 'player.notSameChannel'), COLORS.error);
        }

        const status = await say(message, t(gid, 'player.searching'));
        try {
            const result = await resolve(query, message.author.tag, forcePlaylist);

            if (!queue || queue.destroyed || botChannelId !== voice.id) {
                queue?.destroy();
                queue = await createQueue(message.guild, voice, message.channel);
            } else {
                queue.textChannel = message.channel;
            }

            const tracks = result.kind === 'track' ? [result.track] : result.tracks;
            // The reply below already announces the track, so tell the queue not to announce it again.
            const { startedNow, position } = await queue.enqueue(tracks, false);

            // Sedang diputar = biru, ditambahkan ke antrian = hijau
            let text: string;
            let color: number = COLORS.default;
            if (result.kind === 'playlist') {
                text = startedNow
                    ? t(gid, 'player.playlistNowPlaying', { name: result.name, first: tracks[0].title })
                    : t(gid, 'player.playlistAdded', { name: result.name, count: tracks.length });
                if (!startedNow) color = COLORS.success;
            } else if (startedNow) {
                text = t(gid, 'player.nowPlaying', { title: result.track.title });
            } else {
                text = t(gid, 'player.addedQueue', {title: result.track.title,duration: formatDuration(result.track.duration),position,});
                color = COLORS.success;
            }
            await status.edit({ embeds: [descEmbed(text, color)] });
        } catch (err) {
            if (err instanceof SourceError) {
                const key = err.code === 'MISSING' ? 'player.ytdlpMissing' : err.code === 'NOT_FOUND' ? 'player.noResults' : 'player.playError';
                await status.edit({ embeds: [descEmbed(t(gid, key, { query }), COLORS.error)] });
            } else {
                console.error('[play]', err);
                await status.edit({ embeds: [descEmbed(t(gid, 'player.playError'), COLORS.error)] });
            }
        }
    },
};
