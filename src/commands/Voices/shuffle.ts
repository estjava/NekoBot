import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue, say } from '../../music/guards';

export default {
    name: 'Shuffle',
    description: 'Shuffles the upcoming songs.',
    usage: ['!shuffle'],
    aliases: ['mix'],
    category: 'Voices',
    examples: ['!shuffle'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = await ensureQueue(message);
        if (!queue) return;
        if (queue.tracks.length < 2) return say(message, t(gid, 'player.needTwoSongs'), 0xED4245);
        queue.shuffle();
        return say(message, t(gid, 'player.shuffled', { count: queue.tracks.length }));
    },
};
