import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue } from '../../music/guards';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Skip',
    description: 'Skips the current song.',
    usage: ['!skip'],
    aliases: ['s', 'next'],
    category: 'Voices',
    examples: ['!skip'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = await ensureQueue(message);
        if (!queue) return;

        const current = queue.current;
        if (!current) return say(message, t(gid, 'player.queueEmpty'), COLORS.error);

        // Balas dulu, baru skip. queue.skip() langsung memicu pengumuman "Now playing"
        // lagu berikutnya, jadi kalau dibalik urutannya bisa tampil lebih dulu dari "Skipped".
        await say(message, t(gid, 'player.skipSuccess', { title: current.title }));
        queue.skip();
    },
};