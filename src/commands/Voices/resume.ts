import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue } from '../../music/guards';
import { COLORS, say } from '../../utils/embedBuilder';

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
        if (!queue.current) return say(message, t(gid, 'player.nothingPlaying'), COLORS.error);
        if (!queue.isPaused) return say(message, t(gid, 'player.notPaused'), COLORS.error);
        queue.resume();
        return say(message, t(gid, 'player.resumeSuccess'));
    },
};
