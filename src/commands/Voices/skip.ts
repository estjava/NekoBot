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
        if (!queue.skip()) return say(message, t(gid, 'player.queueEmpty'), COLORS.error);
        return say(message, t(gid, 'player.skipSuccess'));
    },
};
