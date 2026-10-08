import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { createQueue, getQueue } from '../../music/queue';
import { SourceError, formatDuration, resolveRandom } from '../../music/source';
import { ensureVoice } from '../../music/guards';
import { COLORS, descEmbed, say } from '../../utils/embedBuilder';

// Dipakai kalau user tidak menyebut genre/artis. Tambah atau ubah sesuka Anda.
const KEYWORDS = [
    'lagu pop indonesia populer',
    'lagu indonesia hits',
    'lagu galau indonesia',
    'dangdut koplo',
    'lofi hip hop',
    'anime opening',
    'jpop',
    'kpop',
    'city pop',
    'acoustic cover',
    'rock klasik',
    'edm',
];

export default {
    name: 'Random',
    description: 'Plays a random song (optionally from a genre or artist).',
    usage: ['!random [genre or artist]'],
    aliases: ['rand', 'rnd'],
    category: 'Voices',
    examples: ['!random', '!random lofi', '!random Bondan Prakoso'],

    async execute(message: Message, args: string[]) {
        if (!message.guild) return;
        const gid = message.guild.id;

        const voice = await ensureVoice(message);
        if (!voice) return;

        // If the bot is already busy in another channel, don't hijack it.
        let queue = getQueue(gid);
        const botChannelId = message.guild.members.me?.voice.channelId;
        if (queue && botChannelId && botChannelId !== voice.id && (queue.current || queue.tracks.length)) {
            return say(message, t(gid, 'player.notSameChannel'), COLORS.error);
        }

        const query = args.join(' ').trim() || KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
        const status = await say(message, t(gid, 'player.searching'));

        try {
            // Jangan pilih lagu yang sudah ada di antrian / sedang diputar
            const exclude = queue
                ? [...(queue.current ? [queue.current.url] : []), ...queue.tracks.map((tr) => tr.url)]
                : [];
            const track = await resolveRandom(query, message.author.tag, 15, exclude);

            if (!queue || queue.destroyed || botChannelId !== voice.id) {
                queue?.destroy();
                queue = await createQueue(message.guild, voice, message.channel);
            } else {
                queue.textChannel = message.channel;
            }

            const { startedNow, position } = await queue.enqueue([track], false);

            const text = startedNow
                ? t(gid, 'player.nowPlaying', { title: track.title })
                : t(gid, 'player.addedQueue', {
                      title: track.title,
                      duration: formatDuration(track.duration),
                      position,
                  });
            await status.edit({ embeds: [descEmbed(text, startedNow ? COLORS.default : COLORS.success)] });
        } catch (err) {
            if (err instanceof SourceError) {
                const key = err.code === 'MISSING' ? 'player.ytdlpMissing' : err.code === 'NOT_FOUND' ? 'player.noResults' : 'player.playError';
                await status.edit({ embeds: [descEmbed(t(gid, key, { query }), COLORS.error)] });
            } else {
                console.error('[random]', err);
                await status.edit({ embeds: [descEmbed(t(gid, 'player.playError'), COLORS.error)] });
            }
        }
    },
};
