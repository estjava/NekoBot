const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t, usageEmbed } = require('../../utils/locale');

module.exports = {
    name: 'unban',
    description: 'Unban user dari server',
    category: 'Moderation',
    permissions: PermissionFlagsBits.BanMembers,
    usage: '!unban <userID> [reason]',
    examples: [
        '!unban 123456789012345678',
        '!unban 123456789012345678 sudah tobat'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;
        const userId = args[0];

        if (!userId) {
            return message.reply({
                content: t(guildId, 'unban.noId'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        if (!/^\d{17,19}$/.test(userId)) {
            return message.reply({
                content: t(guildId, 'unban.invalidId'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        let banEntry;
        try {
            banEntry = await message.guild.bans.fetch(userId);
        } catch {
            return message.reply(t(guildId, 'unban.notBanned'));
        }

        try {
            await message.guild.members.unban(userId, reason);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(t(guildId, 'unban.title'))
                .setThumbnail(banEntry.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: t(guildId, 'unban.user'), value: `${banEntry.user.tag} (${userId})`, inline: true },
                    { name: t(guildId, 'unban.moderator'), value: message.author.tag, inline: true },
                    { name: t(guildId, 'unban.reason'), value: reason, inline: false }
                )
                .setFooter({ text: t(guildId, 'unban.footer', { user: message.author.tag }) })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'unban.failed'));
        }
    }
};
