const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t } = require('../../utils/locale');

module.exports = {
    name: 'unban',
    description: 'Unban user dari server',
    category: 'Moderation',
    permissions: PermissionFlagsBits.BanMembers,
    usage: '!unban <userID> [reason]',
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const userId = args[0];

        if (!userId) {
            return message.reply(t(guildId, 'unban.noId'));
        }

        if (!/^\d{17,19}$/.test(userId)) {
            return message.reply(t(guildId, 'unban.invalidId'));
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
            console.log(`✅ ${banEntry.user.tag} di-unban dari ${message.guild.name} oleh ${message.author.tag}`);
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'unban.failed'));
        }
    }
};
