import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { auditReason, checkTarget, cleanReason, prefixOf, resolveMember } from '../../utils/moderation';

export default {
    name: 'Unmute',
    description: 'Removes the mute (timeout) of a member.',
    usage: ['!unmute <@user | ID> [reason]'],
    aliases: ['untimeout'],
    category: 'Moderation',
    examples: ['!unmute @user', '!unmute @user apologised'],
    permissions: PermissionFlagsBits.ModerateMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const gid = message.guild.id;

        if (!args[0]) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefixOf(client, gid)}unmute <@user | ID> [reason]` }), COLORS.error);
        }
        const target = await resolveMember(message, args[0]);
        if (!target) return say(message, t(gid, 'mod.notFound'), COLORS.error);

        if (!target.isCommunicationDisabled()) return say(message, t(gid, 'unmute.notMuted'), COLORS.error);

        const problem = checkTarget(message, target, 'mute');
        if (problem) return say(message, t(gid, problem), COLORS.error);

        const reason = cleanReason(args.slice(1).join(' ')) || t(gid, 'mod.noReason');
        try {
            await target.timeout(null, auditReason(message, reason));
        } catch (err) {
            console.error('[unmute]', err);
            return say(message, t(gid, 'mod.failed'), COLORS.error);
        }
        return say(message, t(gid, 'unmute.success', { user: target.user.tag }), COLORS.success);
    },
};
