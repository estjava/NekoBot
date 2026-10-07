import { Message, Client } from 'discord.js';
import { t } from '../../utils/locale';
import { createQueue, getQueue } from '../../music/queue';
import { SourceError, formatDuration, resolve } from '../../music/source';
import { ensureVoice, getPrefix, say } from '../../music/guards';

export default {
    name: 'Play',
    description: 'Plays a song (name or URL) or adds it to the queue.',
    usage: ['!play <song name or URL>'],
    aliases: ['p'],
    category: 'Voices',
    examples: ['!play never gonna give you up', '!play https://www.youtube.com/watch?v=...'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        const query = args.join(' ').trim();
        if (!query) return say(message, t(gid, 'player.playUsage', { prefix: getPrefix(client, gid) }), 0xED4245);

        const voice = await ensureVoice(message);
        if (!voice) return;

        // If the bot is already busy in another channel, don't hijack it.
        let queue = getQueue(gid);
        const botChannelId = message.guild.members.me?.voice.channelId;
        if (queue && botChannelId && botChannelId !== voice.id && (queue.current || queue.tracks.length)) {
            return say(message, t(gid, 'player.notSameChannel'), 0xED4245);
        }

        const status = await message.reply(t(gid, 'player.searching'));
        try {
            const result = await resolve(query, message.author.tag);

            if (!queue || queue.destroyed || botChannelId !== voice.id) {
                queue?.destroy();
                queue = await createQueue(message.guild, voice, message.channel);
            } else {
                queue.textChannel = message.channel;
            }

            const tracks = result.kind === 'track' ? [result.track] : result.tracks;
            const { startedNow, position } = await queue.enqueue(tracks);

            let text: string;
            if (result.kind === 'playlist') {
                text = t(gid, 'player.playlistAdded', { name: result.name, count: tracks.length });
            } else if (startedNow) {
                text = t(gid, 'player.nowPlaying', { title: result.track.title });
            } else {
                text = `${t(gid, 'player.addedQueue', { title: result.track.title })} (#${position}, ${formatDuration(result.track.duration)})`;
            }
            await status.edit({ content: text });
        } catch (err) {
            if (err instanceof SourceError) {
                const key = err.code === 'MISSING' ? 'player.ytdlpMissing' : err.code === 'NOT_FOUND' ? 'player.noResults' : 'player.playError';
                await status.edit({ content: t(gid, key, { query }) });
            } else {
                console.error('[play]', err);
                await status.edit({ content: t(gid, 'player.playError') });
            }
        }
    },
};
