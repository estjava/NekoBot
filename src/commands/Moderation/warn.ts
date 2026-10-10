import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { checkTarget, cleanReason, prefixOf, resolveMember, tryDm } from '../../utils/moderation';
import { addWarning } from '../../utils/warnings';

export default {
    name: 'Warn',
    description: 'Gives a member a warning.',
    usage: ['!warn <@user | ID> [reason]'],
    aliases: [] as string[],
    category: 'Moderation',
    examples: ['!warn @user please keep chat clean'],
    permissions: PermissionFlagsBits.ModerateMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const gid = message.guild.id;

        if (!args[0]) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefixOf(client, gid)}warn <@user | ID> [reason]` }), COLORS.error);
        }
        const target = await resolveMember(message, args[0]);
        if (!target) return say(message, t(gid, 'mod.notFound'), COLORS.error);

        const problem = checkTarget(message, target, 'warn');
        if (problem) return say(message, t(gid, problem), COLORS.error);

        // Shorter limit than other reasons: the warning list shows up to 10 of them in one embed.
        const reason = cleanReason(args.slice(1).join(' '), 200) || t(gid, 'mod.noReason');
        const count = addWarning(gid, target.id, { reason, moderatorId: message.author.id, timestamp: Date.now() });

        await tryDm(target.user, t(gid, 'mod.dm', { action: t(gid, 'mod.actions.warned'), guild: message.guild.name, reason }));
        return say(message, t(gid, 'warn.success', { user: target.user.tag, count, reason }), COLORS.success);
    },
};
