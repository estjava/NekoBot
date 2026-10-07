import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { ensureQueue, say } from '../../music/guards';

export default {
    name: 'Stop',
    description: 'Stops playback and clears the queue (stays in the channel).',
    usage: ['!stop'],
    aliases: [],
    category: 'Voices',
    examples: ['!stop'],

    async execute(message: Message) {
        if (!message.guild) return;
        const queue = await ensureQueue(message);
        if (!queue) return;
        queue.stop();
        return say(message, t(message.guild.id, 'player.stopSuccess'));
    },
};
