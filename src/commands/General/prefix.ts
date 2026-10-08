import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';

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
            return message.reply(t(gid, 'prefix.UserPermission'));
        }

        const newPrefix = args[0];

        if (!newPrefix) {
            return message.reply(t(gid, 'prefix.noPrefix'));
        }

        if (newPrefix.length > 5) {
            return message.reply(t(gid, 'prefix.tooLong'));
        }

        try {
            // Simpan ke memori + utils/database/prefixes.json (didefinisikan di index.ts)
            client.savePrefix(gid, newPrefix);

            await message.reply(t(gid, 'prefix.success', { prefix: newPrefix }));
        } catch (error) {
            console.error(error);
            await message.reply(t(gid, 'prefix.failed'));
        }
    },
};
