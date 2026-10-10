import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { parseUserId, prefixOf } from '../../utils/moderation';
import { clearWarnings, getWarnings, removeWarning } from '../../utils/warnings';

export default {
    name: 'Unwarn',
    description: 'Removes one warning (by number) or all warnings of a member.',
    usage: ['!unwarn <@user | ID> <number | all>'],
    aliases: ['delwarn'],
    category: 'Moderation',
    examples: ['!unwarn @user 2', '!unwarn @user all'],
    permissions: PermissionFlagsBits.ModerateMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const prefix = prefixOf(client, gid);

        const id = parseUserId(args[0]);
        if (!id) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefix}unwarn <@user | ID> <number | all>` }), COLORS.error);
        }
        const user = `<@${id}>`;
        const what = (args[1] ?? '').toLowerCase();

        if (what === 'all') {
            const count = clearWarnings(gid, id);
            if (!count) return say(message, t(gid, 'warnings.none', { user }), COLORS.error);
            return say(message, t(gid, 'unwarn.cleared', { user, count }), COLORS.success);
        }

        if (!/^\d+$/.test(what)) {
            return say(message, t(gid, 'unwarn.usage', { prefix }), COLORS.error);
        }
        const number = Number(what);
        if (!getWarnings(gid, id).length) return say(message, t(gid, 'warnings.none', { user }), COLORS.error);
        if (!removeWarning(gid, id, number)) return say(message, t(gid, 'unwarn.notFound', { user, number }), COLORS.error);
        return say(message, t(gid, 'unwarn.removed', { user, number }), COLORS.success);
    },
};
