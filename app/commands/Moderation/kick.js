const { PermissionFlagsBits } = require('discord.js');
const { t } = require('../../utils/locale');

module.exports = {
    name: 'kick',
    description: 'Kick member dari server',
    category: 'Moderation',
    permissions: PermissionFlagsBits.KickMembers,
    usage: '!kick @user [reason]',
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const member = message.mentions.members.first();

        if (!member) {
            return message.reply(t(guildId, 'kick.noMention'));
        }

        if (!member.kickable) {
            return message.reply(t(guildId, 'kick.notKickable'));
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.kick(reason);
            message.reply(t(guildId, 'kick.success', { tag: member.user.tag, reason }));
            console.log(`👢 ${member.user.tag} di-kick dari ${message.guild.name} oleh ${message.author.tag}`);
        } catch (err) {
            console.error(err);
            message.reply(t(guildId, 'kick.failed'));
        }
    }
};
