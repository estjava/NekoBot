const { PermissionFlagsBits } = require('discord.js');
const { t, usageEmbed } = require('../../utils/locale');

module.exports = {
    name: 'kick',
    description: 'Kick member dari server',
    category: 'Moderation',
    permissions: PermissionFlagsBits.KickMembers,
    usage: '!kick @user [reason]',
    examples: [
        '!kick @user',
        '!kick @user spam'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;
        const member = message.mentions.members.first();

        if (!member) {
            return message.reply({
                content: t(guildId, 'kick.noMention'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        if (!member.kickable) {
            return message.reply(t(guildId, 'kick.notKickable'));
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.kick(reason);
            message.reply(t(guildId, 'kick.success', { tag: member.user.tag, reason }));
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'kick.failed'));
        }
    }
};
