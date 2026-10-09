import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Prefix',
    description: 'Changes the bots prefix.',
    usage: ['!prefix <newPrefix>'],
    aliases: ['setprefix'],
    category: 'General',
    examples: ['!prefix !', '!prefix ?'],
    permissions: PermissionFlagsBits.ManageGuild,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return say(message, t(gid, 'prefix.UserPermission'), COLORS.error);
        }

        const newPrefix = args[0];

        if (!newPrefix) {
            return say(message, t(gid, 'prefix.noPrefix'), COLORS.error);
        }

        if (newPrefix.length > 5) {
            return say(message, t(gid, 'prefix.tooLong'), COLORS.error);
        }

        try {
            // Simpan ke memori + data/prefixes.json (didefinisikan di index.ts)
            client.savePrefix(gid, newPrefix);

            await say(message, t(gid, 'prefix.success', { prefix: newPrefix }), COLORS.success);
        } catch (error) {
            console.error(error);
            await say(message, t(gid, 'prefix.failed'), COLORS.error);
        }
    },
};
