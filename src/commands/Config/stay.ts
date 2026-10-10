import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { getQueue } from '../../music/queue';
import { COLORS, say } from '../../utils/embedBuilder';
import { getSettings, idleMinutes, updateSettings } from '../../utils/settings';

const ON_WORDS = ['on', 'enable', 'true', 'yes', '1'];
const OFF_WORDS = ['off', 'disable', 'false', 'no', '0'];

export default {
    name: '247',
    description: 'Keeps the bot in the voice channel even when nothing is playing.',
    usage: ['!247 [on | off]'],
    aliases: ['stay', '24/7'],
    category: 'Config',
    examples: ['!247', '!247 on', '!247 off'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const prefix = client.prefixes.get(gid) || client.config.prefix;
        const word = (args[0] ?? '').toLowerCase();

        // No argument: show the current state (anyone can look)
        if (!word) {
            const key = getSettings(gid).stay247 ? 'stay.statusOn' : 'stay.statusOff';
            return say(message, t(gid, key, { minutes: idleMinutes(gid), prefix }));
        }

        const turnOn = ON_WORDS.includes(word);
        const turnOff = OFF_WORDS.includes(word);
        if (!turnOn && !turnOff) {
            return say(message, t(gid, 'stay.invalid', { prefix }), COLORS.error);
        }

        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return say(message, t(gid, 'common.manageServer'), COLORS.error);
        }

        updateSettings(gid, { stay247: turnOn ? true : undefined });
        // If the bot is idling in a channel right now, apply the change to the running timer.
        getQueue(gid)?.refreshIdleTimer();

        return say(
            message,
            t(gid, turnOn ? 'stay.enabled' : 'stay.disabled', { minutes: idleMinutes(gid) }),
            COLORS.success
        );
    },
};
