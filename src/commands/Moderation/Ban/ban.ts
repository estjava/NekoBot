import { Message, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../../utils/locale';

export default {
    name: 'Banned',
    description: 'Bans a user from the server.',
    usage: ['!ban <user> [reason]'],
    aliases: ['ban'],
    category: 'Moderation',
    examples: ['!ban @user Spamming', '!ban @user Breaking rules'],
    permissions: PermissionFlagsBits.BanMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;

        // Bot's own permissions
        if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply(t(message.guild.id, 'ban.BotPermission'));
        }

        // Caller's permissions
        if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply(t(message.guild.id, 'ban.UserPermission'));
        }

        if (!args[0]) {
            return message.reply(t(message.guild.id, 'ban.noMention'));
        }

        // Resolve target: mention first, fall back to raw ID (stripping mention syntax if present)
        const rawId = args[0].replace(/[<@!>]/g, '');
        const target =
            message.mentions.members?.first() ??
            (await message.guild.members.fetch(rawId).catch(() => null));

        if (!target) {
            return message.reply(t(message.guild.id, 'ban.noMention'));
        }

        if (target.id === message.author.id) {
            return message.reply(t(message.guild.id, 'ban.noSelfBan'));
        }

        if (target.id === client.user?.id) {
            return message.reply(t(message.guild.id, 'ban.banBot'));
        }

        if (!target.bannable) {
            return message.reply(t(message.guild.id, 'ban.notBannable'));
        }

        const reason = args.slice(1).join(' ') || t(message.guild.id, 'ban.noReason');

        try {
            await target.ban({ reason });

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Member Banned')
                .addFields(
                    { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason },
                )
                .setTimestamp();

            if (message.channel.isTextBased() && 'send' in message.channel) {
                await message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            return message.reply(t(message.guild.id, 'ban.failed'));
        }
    },
};