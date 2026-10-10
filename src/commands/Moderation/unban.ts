import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { auditReason, cleanReason, parseUserId, prefixOf } from '../../utils/moderation';

export default {
    name: 'Unban',
    description: 'Removes the ban of a user.',
    usage: ['!unban <ID> [reason]'],
    aliases: ['pardon'],
    category: 'Moderation',
    examples: ['!unban 123456789012345678', '!unban 123456789012345678 appeal accepted'],
    permissions: PermissionFlagsBits.BanMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const guild = message.guild;
        const gid = guild.id;

        const id = parseUserId(args[0]);
        if (!id) {
            return say(message, t(gid, 'unban.noId', { usage: `${prefixOf(client, gid)}unban <ID> [reason]` }), COLORS.error);
        }

        // Without this permission the ban list cannot even be read, which would look like "not banned".
        if (!guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return say(message, t(gid, 'mod.botMissing'), COLORS.error);
        }

        const ban = await guild.bans.fetch(id).catch(() => null);
        if (!ban) return say(message, t(gid, 'unban.notBanned'), COLORS.error);

        const reason = cleanReason(args.slice(1).join(' ')) || t(gid, 'mod.noReason');
        try {
            await guild.members.unban(id, auditReason(message, reason));
        } catch (err) {
            console.error('[unban]', err);
            return say(message, t(gid, 'mod.failed'), COLORS.error);
        }
        return say(message, t(gid, 'unban.success', { user: ban.user.tag, reason }), COLORS.success);
    },
};
