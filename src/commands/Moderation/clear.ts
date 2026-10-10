import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, descEmbed, say } from '../../utils/embedBuilder';
import { parseUserId, prefixOf } from '../../utils/moderation';

const MAX_AMOUNT = 100; // Discord fetches/deletes at most 100 messages at once
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000; // Discord cannot bulk delete older messages
const NOTICE_SECONDS = 5; // how long the "Deleted ..." notice stays

export default {
    name: 'Clear',
    description: 'Deletes the latest messages in this channel.',
    usage: ['!clear <1-100> [@user | ID]'],
    aliases: ['purge', 'prune'],
    category: 'Moderation',
    examples: ['!clear 50', '!clear 20 @user'],
    permissions: PermissionFlagsBits.ManageMessages,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild || !message.member) return;
        const gid = message.guild.id;
        const channel = message.channel;
        if (!channel.isTextBased() || channel.isDMBased() || !('bulkDelete' in channel)) return;

        const prefix = prefixOf(client, gid);
        const usage = `${prefix}clear <1-${MAX_AMOUNT}> [@user | ID]`;

        // Amount: a whole number from 1 to 100
        if (!/^\d+$/.test(args[0] ?? '')) {
            return say(message, t(gid, 'clear.usage', { max: MAX_AMOUNT, usage }), COLORS.error);
        }
        const amount = Number(args[0]);
        if (amount < 1 || amount > MAX_AMOUNT) {
            return say(message, t(gid, 'clear.usage', { max: MAX_AMOUNT, usage }), COLORS.error);
        }

        // Optional: only delete messages from this user (works for users who already left)
        let userId: string | null = null;
        if (args[1]) {
            userId = parseUserId(args[1]);
            if (!userId) return say(message, t(gid, 'clear.invalidUser'), COLORS.error);
        }

        // The permission on the command checks the server-wide permission; channel overrides can differ.
        const me = message.guild.members.me;
        if (!channel.permissionsFor(message.member)?.has(PermissionFlagsBits.ManageMessages)) {
            return say(message, t(gid, 'common.noPermission'), COLORS.error);
        }
        const botPerms = me ? channel.permissionsFor(me) : null;
        if (!botPerms?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory])) {
            return say(message, t(gid, 'clear.botMissing'), COLORS.error);
        }

        try {
            // The latest N messages before the command itself, so the command does not count.
            const latest = await channel.messages.fetch({ limit: amount, before: message.id });
            const matching = latest.filter((m) => !m.pinned && (!userId || m.author.id === userId));
            const deletable = matching.filter((m) => Date.now() - m.createdTimestamp < TWO_WEEKS_MS);
            const tooOld = matching.size - deletable.size;

            if (deletable.size === 0) {
                return say(message, t(gid, 'clear.nothing'), COLORS.error);
            }

            const deleted = await channel.bulkDelete(deletable, true);
            await message.delete().catch(() => {}); // the command message goes too

            let text = userId
                ? t(gid, 'clear.successUser', { count: deleted.size, user: `<@${userId}>` })
                : t(gid, 'clear.success', { count: deleted.size });
            if (tooOld > 0) text += `\n${t(gid, 'clear.tooOld', { count: tooOld })}`;

            // Send (not reply): the command message no longer exists. The notice deletes itself.
            const notice = await channel.send({ embeds: [descEmbed(text, COLORS.success)] });
            setTimeout(() => notice.delete().catch(() => {}), NOTICE_SECONDS * 1000);
        } catch (err) {
            console.error('[clear]', err);
            return say(message, t(gid, 'mod.failed'), COLORS.error);
        }
    },
};
