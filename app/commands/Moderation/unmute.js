const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t } = require('../../utils/locale');

module.exports = {
    name: 'unmute',
    description: 'Hapus timeout member',
    category: 'Moderation',
    permissions: PermissionFlagsBits.ModerateMembers,
    usage: '!unmute @user [reason]',
    aliases: ['untimeout'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const member = message.mentions.members.first();

        if (!member) {
            return message.reply(t(guildId, 'unmute.noMention'));
        }

        if (!member.isCommunicationDisabled()) {
            return message.reply(t(guildId, 'unmute.notMuted'));
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.timeout(null, reason);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(t(guildId, 'unmute.title'))
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: t(guildId, 'unmute.user'), value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: t(guildId, 'unmute.moderator'), value: message.author.tag, inline: true },
                    { name: t(guildId, 'unmute.reason'), value: reason, inline: false }
                )
                .setFooter({ text: t(guildId, 'unmute.footer', { user: message.author.tag }) })
                .setTimestamp();

            message.reply({ embeds: [embed] });
            console.log(`🔊 ${member.user.tag} di-unmute di ${message.guild.name} oleh ${message.author.tag}`);
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'unmute.failed'));
        }
    }
};
