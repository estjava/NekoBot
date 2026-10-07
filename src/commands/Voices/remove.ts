import { Client, Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue, getPrefix, say } from '../../music/guards';

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
        const removed = queue.remove(parseInt(args[0]));
        if (!removed) return say(message, t(gid, 'player.removeUsage', { prefix: getPrefix(client, gid) }), 0xED4245);
        return say(message, t(gid, 'player.removed', { title: removed.title }));
    },
};
