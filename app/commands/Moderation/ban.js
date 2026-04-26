const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t } = require('../../utils/locale');

module.exports = {
    name: 'ban',
    description: 'Ban member dari server',
    category: 'Moderation',
    permissions: PermissionFlagsBits.BanMembers,
    usage: '!ban @user [hari_delete_pesan] [reason]',
    aliases: ['banned'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const member = message.mentions.members.first();

        if (!member) {
            return message.reply(t(guildId, 'ban.noMention'));
        }

        if (!member.bannable) {
            return message.reply(t(guildId, 'ban.notBannable'));
        }

        if (member.id === message.author.id) {
            return message.reply(t(guildId, 'ban.selfBan'));
        }

        if (member.id === client.user.id) {
            return message.reply(t(guildId, 'ban.botBan'));
        }

        const remainingArgs = args.slice(1);

        let deleteMessageDays = 0;
        if (remainingArgs.length > 0 && !isNaN(remainingArgs[0])) {
            deleteMessageDays = Math.min(Math.max(parseInt(remainingArgs[0]), 0), 7);
            remainingArgs.shift();
        }

        const reason = remainingArgs.join(' ') || 'No reason provided';

        try {
            await member.ban({ deleteMessageDays, reason });

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(t(guildId, 'ban.title'))
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: t(guildId, 'ban.user'), value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: t(guildId, 'ban.moderator'), value: message.author.tag, inline: true },
                    { name: t(guildId, 'ban.deleteMsg'), value: t(guildId, 'ban.days', { days: deleteMessageDays }), inline: true },
                    { name: t(guildId, 'ban.reason'), value: reason, inline: false }
                )
                .setFooter({ text: t(guildId, 'ban.footer', { user: message.author.tag }) })
                .setTimestamp();

            message.reply({ embeds: [embed] });
            console.log(`🔨 ${member.user.tag} dibanned dari ${message.guild.name} oleh ${message.author.tag}`);
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'ban.failed'));
        }
    }
};
