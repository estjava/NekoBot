import { Client, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';

export default {
    name: 'Prefix',
    description: 'Changes the bots prefix.',
    usage: ['!prefix <newPrefix>'],
    aliases: ['p'],
    category: 'General',
    examples: ['!prefix !', '!prefix ?'],
    permissions: PermissionFlagsBits.ManageGuild,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;

        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply(t(message.guild.id, 'prefix.noPermission'));
        }

        const newPrefix = args[0];

        if (!newPrefix) {
            return message.reply(t(message.guild.id, 'prefix.noPrefix'));
        }

        if (newPrefix.length > 5) {
            return message.reply(t(message.guild.id, 'prefix.tooLong'));
        }

        try {
            // Persist the prefix in your database or configuration
            // Example: await updateGuildPrefix(message.guild.id, newPrefix);

            await message.reply(t(message.guild.id, 'prefix.success', { prefix: newPrefix }));
        } catch (error) {
            console.error(error);
            await message.reply(t(message.guild.id, 'prefix.failed'));
        }
    },
};