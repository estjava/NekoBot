import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { getQueue } from '../../music/queue';
import { COLORS, say } from '../../utils/embedBuilder';
import {
    IDLE_MAX_MINUTES,
    IDLE_MIN_MINUTES,
    defaultIdleMinutes,
    getSettings,
    idleMinutes,
    updateSettings,
} from '../../utils/settings';

const RESET_WORDS = ['reset', 'default'];

export default {
    name: 'IdleTime',
    description: 'Shows or sets how long the bot waits before leaving an idle voice channel.',
    usage: ['!idletime [minutes | reset]'],
    aliases: ['idle'],
    category: 'Config',
    examples: ['!idletime', '!idletime 5', '!idletime reset'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const prefix = client.prefixes.get(gid) || client.config.prefix;
        const input = (args[0] ?? '').toLowerCase();

        // 24/7 mode makes the idle time irrelevant; say so instead of confusing people.
        const stayNote = () => (getSettings(gid).stay247 ? `\n${t(gid, 'idletime.stayNote', { prefix })}` : '');

        // No argument: show the current value (anyone can look)
        if (!input) {
            const custom = getSettings(gid).idleMinutes !== undefined;
            const key = custom ? 'idletime.current' : 'idletime.currentDefault';
            return say(message, t(gid, key, { minutes: idleMinutes(gid), prefix }) + stayNote());
        }

        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return say(message, t(gid, 'common.manageServer'), COLORS.error);
        }

        if (RESET_WORDS.includes(input)) {
            updateSettings(gid, { idleMinutes: undefined });
            getQueue(gid)?.refreshIdleTimer();
            return say(
                message,
                t(gid, 'idletime.reset', { minutes: defaultIdleMinutes() }) + stayNote(),
                COLORS.success
            );
        }

        // Accept "5", "5m", "5min", "5menit"
        const match = input.match(/^(\d+)\s*(m|min|mins|minute|minutes|menit)?$/);
        const minutes = match ? Number(match[1]) : NaN;
        if (!Number.isInteger(minutes) || minutes < IDLE_MIN_MINUTES || minutes > IDLE_MAX_MINUTES) {
            return say(
                message,
                t(gid, 'idletime.invalid', { min: IDLE_MIN_MINUTES, max: IDLE_MAX_MINUTES, prefix }),
                COLORS.error
            );
        }

        updateSettings(gid, { idleMinutes: minutes });
        // If the bot is idling right now, restart its countdown with the new value.
        getQueue(gid)?.refreshIdleTimer();
        return say(message, t(gid, 'idletime.changed', { minutes }) + stayNote(), COLORS.success);
    },
};
