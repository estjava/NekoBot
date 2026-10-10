import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { auditReason, checkTarget, cleanReason, prefixOf, resolveMember, tryDm } from '../../utils/moderation';

export default {
    name: 'Kick',
    description: 'Kicks a member from the server.',
    usage: ['!kick <@user | ID> [reason]'],
    aliases: [] as string[],
    category: 'Moderation',
    examples: ['!kick @user spamming', '!kick 123456789012345678'],
    permissions: PermissionFlagsBits.KickMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const gid = message.guild.id;

        if (!args[0]) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefixOf(client, gid)}kick <@user | ID> [reason]` }), COLORS.error);
        }
        const target = await resolveMember(message, args[0]);
        if (!target) return say(message, t(gid, 'mod.notFound'), COLORS.error);

        const problem = checkTarget(message, target, 'kick');
        if (problem) return say(message, t(gid, problem), COLORS.error);

        const reason = cleanReason(args.slice(1).join(' ')) || t(gid, 'mod.noReason');

        // DM first: once the member is gone, the bot may no longer share a server with them.
        await tryDm(target.user, t(gid, 'mod.dm', { action: t(gid, 'mod.actions.kicked'), guild: message.guild.name, reason }));
        try {
            await target.kick(auditReason(message, reason));
        } catch (err) {
            console.error('[kick]', err);
            return say(message, t(gid, 'mod.failed'), COLORS.error);
        }
        return say(message, t(gid, 'kick.success', { user: target.user.tag, reason }), COLORS.success);
    },
};
