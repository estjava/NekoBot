import { Client, Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue, getPrefix } from '../../music/guards';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Remove',
    description: 'Removes a song from the queue by its position.',
    usage: ['!remove <position>'],
    aliases: ['rm'],
    category: 'Voices',
    examples: ['!remove 3'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = await ensureQueue(message);
        if (!queue) return;

        // Number(undefined) / Number('abc') = NaN. parseInt + NaN sebelumnya lolos
        // pengecekan di queue.remove() dan menghapus lagu pertama, jadi cek di sini.
        const position = Number(args[0]);
        if (!Number.isInteger(position)) {
            return say(message, t(gid, 'player.removeUsage', { prefix: getPrefix(client, gid) }), COLORS.error);
        }

        const removed = queue.remove(position);
        if (!removed) return say(message, t(gid, 'player.removeUsage', { prefix: getPrefix(client, gid) }), COLORS.error);
        return say(message, t(gid, 'player.removed', { title: removed.title }));
    },
};
