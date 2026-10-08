import { Client, Message } from 'discord.js';
import { t } from '../../utils/locale';
import { LoopMode } from '../../music/queue';
import { ensureQueue, getPrefix } from '../../music/guards';
import { COLORS, say } from '../../utils/embedBuilder';

const MODES: LoopMode[] = ['off', 'track', 'queue'];
const KEY: Record<LoopMode, string> = { off: 'player.loopOff', track: 'player.loopTrack', queue: 'player.loopQueue' };

export default {
    name: 'Loop',
    description: 'Sets loop mode: off, track, or queue (no argument cycles through them).',
    usage: ['!loop [off|track|queue]'],
    aliases: ['repeat'],
    category: 'Voices',
    examples: ['!loop', '!loop track', '!loop queue'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const queue = await ensureQueue(message);
        if (!queue) return;

        let mode: LoopMode;
        if (!args[0]) {
            mode = MODES[(MODES.indexOf(queue.loop) + 1) % MODES.length];
        } else {
            const arg = args[0].toLowerCase();
            const found = MODES.find((m) => m === arg);
            if (!found) return say(message, t(gid, 'player.loopUsage', { prefix: getPrefix(client, gid) }), COLORS.error);
            mode = found;
        }
        queue.loop = mode;
        return say(message, t(gid, KEY[mode]));
    },
};
