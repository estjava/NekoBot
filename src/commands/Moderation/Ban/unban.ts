import { Message, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../../utils/locale';

export default {
    name: 'Unbanned',
    description: 'Unbans a user from the server.',
    usage: ['!unban <userId> [reason]'],
    aliases: ['unban'],
    category: 'Moderation',
    examples: ['!unban 123456789012345678', '!unban 123456789012345678 Appeal accepted'],
    permissions: PermissionFlagsBits.BanMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;

        // Bot's own permissions
        if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply(t(message.guild.id, 'unban.BotPermission'));
        }

        // Caller's permissions
        if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply(t(message.guild.id, 'unban.UserPermission'));
        }

        // Unlike ban, the target won't be in the guild, so it can't be mentioned — only an ID works.
        const userId = args[0]?.replace(/[<@!>]/g, '');

        if (!userId || !/^\d{17,20}$/.test(userId)) {
            return message.reply(t(message.guild.id, 'unban.noMention'));
        }

        // Confirm the user is actually banned before attempting to unban
        const banEntry = await message.guild.bans.fetch(userId).catch(() => null);

        if (!banEntry) {
            return message.reply(t(message.guild.id, 'unban.notBanned'));
        }

        const reason = args.slice(1).join(' ') || t(message.guild.id, 'unban.noReason') ;

        try {
            await message.guild.members.unban(userId, reason);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Member Unbanned')
                .addFields(
                    { name: 'User', value: `${banEntry.user.tag} (${banEntry.user.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason },
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            return message.reply(t(message.guild.id, 'unban.failed'));
        }
    },
};