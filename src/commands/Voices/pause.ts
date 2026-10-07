import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue, say } from '../../music/guards';

export default {
    name: 'Pause',
    description: 'Pauses the current song.',
    usage: ['!pause'],
    aliases: [],
    category: 'Voices',
    examples: ['!pause'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = await ensureQueue(message);
        if (!queue) return;
        if (!queue.current) return say(message, t(gid, 'player.nothingPlaying'), 0xED4245);
        if (queue.isPaused) return say(message, t(gid, 'player.alreadyPaused'), 0xED4245);
        queue.pause();
        return say(message, t(gid, 'player.pauseSuccess'));
    },
};
