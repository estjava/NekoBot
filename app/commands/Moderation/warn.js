const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t, usageEmbed } = require('../../utils/locale');
const fs = require('fs');
const path = require('path');

const warnPath = path.join(__dirname, '../../database/warnings.json');

function loadWarnings() {
    try {
        return JSON.parse(fs.readFileSync(warnPath, 'utf8'));
    } catch {
        return {};
    }
}

function saveWarnings(data) {
    fs.writeFileSync(warnPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'warn',
    description: 'Beri peringatan kepada member',
    category: 'Moderation',
    permissions: PermissionFlagsBits.ModerateMembers,
    usage: '!warn @user [reason]',
    examples: [
        '!warn @user',
        '!warn @user spam',
        '!warn @user toxic di channel'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;
        const member = message.mentions.members.first();

        if (!member) {
            return message.reply({
                content: t(guildId, 'warn.noMention'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        if (member.id === message.author.id) {
            return message.reply(t(guildId, 'warn.selfWarn'));
        }

        if (member.user.bot) {
            return message.reply(t(guildId, 'warn.botWarn'));
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        const warnings = loadWarnings();
        const userId = member.id;

        if (!warnings[guildId]) warnings[guildId] = {};
        if (!warnings[guildId][userId]) warnings[guildId][userId] = [];

        warnings[guildId][userId].push({
            id: Date.now().toString(),
            reason,
            moderator: message.author.id,
            moderatorTag: message.author.tag,
            timestamp: Date.now()
        });

        saveWarnings(warnings);

        const totalWarns = warnings[guildId][userId].length;

        const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle(t(guildId, 'warn.title'))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: t(guildId, 'warn.user'), value: `${member.user.tag} (${member.id})`, inline: true },
                { name: t(guildId, 'warn.moderator'), value: message.author.tag, inline: true },
                { name: t(guildId, 'warn.totalWarns'), value: t(guildId, 'warn.warnsCount', { count: totalWarns }), inline: true },
                { name: t(guildId, 'warn.reason'), value: reason, inline: false }
            )
            .setFooter({ text: t(guildId, 'warn.footer', { count: totalWarns }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle(t(guildId, 'warn.dmTitle', { guild: message.guild.name }))
                .addFields(
                    { name: t(guildId, 'warn.reason'), value: reason },
                    { name: t(guildId, 'warn.totalWarns'), value: t(guildId, 'warn.warnsCount', { count: totalWarns }) }
                )
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] });
        } catch {
            // User menonaktifkan DM, abaikan
        }
    }
};
