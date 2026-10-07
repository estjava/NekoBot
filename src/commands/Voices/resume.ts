import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue, say } from '../../music/guards';

export default {
    name: 'Resume',
    description: 'Resumes the paused song.',
    usage: ['!resume'],
    aliases: ['unpause'],
    category: 'Voices',
    examples: ['!resume'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = await ensureQueue(message);
        if (!queue) return;
        if (!queue.current) return say(message, t(gid, 'player.nothingPlaying'), 0xED4245);
        if (!queue.isPaused) return say(message, t(gid, 'player.notPaused'), 0xED4245);
        queue.resume();
        return say(message, t(gid, 'player.resumeSuccess'));
    },
};
