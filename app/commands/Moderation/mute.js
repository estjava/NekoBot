const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t, usageEmbed } = require('../../utils/locale');

function parseDuration(str) {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    return parseInt(match[1]) * units[match[2]];
}

function formatDuration(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ');
}

module.exports = {
    name: 'mute',
    description: 'Timeout member dari server',
    category: 'Moderation',
    permissions: PermissionFlagsBits.ModerateMembers,
    usage: '!mute @user <durasi> [reason]',
    aliases: ['timeout'],
    examples: [
        '!mute @user 10m',
        '!mute @user 2h spam',
        '!mute @user 1d toxic'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;
        const member = message.mentions.members.first();

        if (!member) {
            return message.reply({
                content: t(guildId, 'mute.noMention'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        if (member.id === message.author.id) {
            return message.reply(t(guildId, 'mute.selfMute'));
        }

        if (member.id === client.user.id) {
            return message.reply(t(guildId, 'mute.botMute'));
        }

        if (!member.moderatable) {
            return message.reply(t(guildId, 'mute.notModeratable'));
        }

        const durationStr = args[1];
        if (!durationStr) {
            return message.reply({
                content: t(guildId, 'mute.noDuration'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return message.reply({
                content: t(guildId, 'mute.invalidDuration'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        if (durationMs > 28 * 24 * 60 * 60 * 1000) {
            return message.reply(t(guildId, 'mute.maxDuration'));
        }

        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await member.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle(t(guildId, 'mute.title'))
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: t(guildId, 'mute.user'), value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: t(guildId, 'mute.moderator'), value: message.author.tag, inline: true },
                    { name: t(guildId, 'mute.duration'), value: formatDuration(durationMs), inline: true },
                    { name: t(guildId, 'mute.ends'), value: `<t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`, inline: true },
                    { name: t(guildId, 'mute.reason'), value: reason, inline: false }
                )
                .setFooter({ text: t(guildId, 'mute.footer', { user: message.author.tag }) })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'mute.failed'));
        }
    }
};
