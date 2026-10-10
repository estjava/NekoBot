import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import {
    MAX_TIMEOUT_MS,
    auditReason,
    checkTarget,
    cleanReason,
    formatDuration,
    parseDuration,
    prefixOf,
    resolveMember,
    tryDm,
} from '../../utils/moderation';

const DEFAULT_MUTE_MS = 10 * 60 * 1000;

export default {
    name: 'Mute',
    description: 'Mutes a member (Discord timeout) for a set time.',
    usage: ['!mute <@user | ID> [duration] [reason]'],
    aliases: ['timeout'],
    category: 'Moderation',
    examples: ['!mute @user 10m spamming', '!mute @user 2h', '!mute @user'],
    permissions: PermissionFlagsBits.ModerateMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const gid = message.guild.id;

        if (!args[0]) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefixOf(client, gid)}mute <@user | ID> [duration] [reason]` }), COLORS.error);
        }
        const target = await resolveMember(message, args[0]);
        if (!target) return say(message, t(gid, 'mod.notFound'), COLORS.error);

        // "!mute @user 10m spam": duration is optional (default 10m); everything after it is the reason.
        let duration = parseDuration(args[1]);
        let reasonFrom = 2;
        if (duration === null) {
            // Something like "10x" is a typo, not a reason.
            if (args[1] && /^\d/.test(args[1])) return say(message, t(gid, 'mute.invalidDuration'), COLORS.error);
            duration = DEFAULT_MUTE_MS;
            reasonFrom = 1;
        }
        if (duration < 1_000) return say(message, t(gid, 'mute.invalidDuration'), COLORS.error);
        if (duration > MAX_TIMEOUT_MS) return say(message, t(gid, 'mute.tooLong'), COLORS.error);

        const problem = checkTarget(message, target, 'mute');
        if (problem) return say(message, t(gid, problem), COLORS.error);

        const reason = cleanReason(args.slice(reasonFrom).join(' ')) || t(gid, 'mod.noReason');
        const length = formatDuration(duration);
        try {
            await target.timeout(duration, auditReason(message, reason));
        } catch (err) {
            console.error('[mute]', err);
            return say(message, t(gid, 'mod.failed'), COLORS.error);
        }
        await tryDm(target.user, t(gid, 'mod.dm', { action: t(gid, 'mod.actions.muted', { duration: length }), guild: message.guild.name, reason }));
        return say(message, t(gid, 'mute.success', { user: target.user.tag, duration: length, reason }), COLORS.success);
    },
};
