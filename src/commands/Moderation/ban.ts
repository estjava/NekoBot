import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { auditReason, checkTarget, cleanReason, parseUserId, prefixOf, resolveMember, tryDm } from '../../utils/moderation';

export default {
    name: 'Ban',
    description: 'Bans a member (or a user ID) from the server.',
    usage: ['!ban <@user | ID> [reason]'],
    aliases: [] as string[],
    category: 'Moderation',
    examples: ['!ban @user advertising', '!ban 123456789012345678 raid account'],
    permissions: PermissionFlagsBits.BanMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const guild = message.guild;
        const gid = guild.id;

        const id = parseUserId(args[0]);
        if (!id) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefixOf(client, gid)}ban <@user | ID> [reason]` }), COLORS.error);
        }

        // The target may already have left the server; banning by ID still works then.
        const member = await resolveMember(message, args[0]);
        let user = member?.user ?? null;
        if (member) {
            const problem = checkTarget(message, member, 'ban');
            if (problem) return say(message, t(gid, problem), COLORS.error);
        } else {
            if (id === message.author.id) return say(message, t(gid, 'mod.self'), COLORS.error);
            if (id === client.user?.id) return say(message, t(gid, 'mod.bot'), COLORS.error);
            user = await client.users.fetch(id).catch(() => null);
            if (!user) return say(message, t(gid, 'ban.userNotFound'), COLORS.error);
        }

        const alreadyBanned = await guild.bans.fetch(id).then(() => true).catch(() => false);
        if (alreadyBanned) return say(message, t(gid, 'ban.already'), COLORS.error);

        const reason = cleanReason(args.slice(1).join(' ')) || t(gid, 'mod.noReason');

        // DM first: after the ban the user can no longer be reached through this server.
        if (member) {
            await tryDm(user!, t(gid, 'mod.dm', { action: t(gid, 'mod.actions.banned'), guild: guild.name, reason }));
        }
        try {
            await guild.members.ban(id, { reason: auditReason(message, reason) });
        } catch (err) {
            console.error('[ban]', err);
            return say(message, t(gid, 'mod.failed'), COLORS.error);
        }
        return say(message, t(gid, 'ban.success', { user: user!.tag, reason }), COLORS.success);
    },
};
