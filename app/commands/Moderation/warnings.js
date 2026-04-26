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

module.exports = {
    name: 'warnings',
    description: 'Lihat daftar warn member',
    category: 'Moderation',
    permissions: PermissionFlagsBits.ModerateMembers,
    usage: '!warnings [@user]',
    aliases: ['warns', 'listwarn'],
    examples: [
        '!warnings',
        '!warnings @user'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const user = message.mentions.users.first() || message.author;
        const warnings = loadWarnings();
        const guildWarns = warnings[guildId]?.[user.id] || [];

        if (guildWarns.length === 0) {
            return message.reply(t(guildId, 'warnings.noWarns', { tag: user.tag }));
        }

        const warnList = guildWarns.map((w, i) =>
            t(guildId, 'warnings.entry', {
                num: i + 1,
                reason: w.reason,
                mod: w.moderatorTag,
                time: `<t:${Math.floor(w.timestamp / 1000)}:R>`
            })
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle(t(guildId, 'warnings.title', { tag: user.tag }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(warnList)
            .setFooter({ text: t(guildId, 'warnings.footer', { count: guildWarns.length }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
