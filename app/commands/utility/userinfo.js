const { EmbedBuilder } = require('discord.js');
const { t } = require('../../utils/locale');

module.exports = {
    name: 'userinfo',
    description: 'Informasi tentang user',
    aliases: ['ui'],
    usage: '!userinfo [@user]',
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const user = message.mentions.users.first() || message.author;

        let member;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch {
            member = null;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(t(guildId, 'userinfo.title', { tag: user.tag }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: t(guildId, 'userinfo.userId'), value: user.id, inline: true },
                { name: t(guildId, 'userinfo.accountCreated'), value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                {
                    name: t(guildId, 'userinfo.joinedServer'),
                    value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : t(guildId, 'userinfo.notInServer'),
                    inline: true
                },
                {
                    name: t(guildId, 'userinfo.roles'),
                    value: member
                        ? member.roles.cache.map(r => r).join(', ').replace('@everyone', '') || t(guildId, 'userinfo.noRoles')
                        : 'N/A',
                    inline: false
                }
            )
            .setFooter({ text: t(guildId, 'userinfo.requestedBy', { user: message.author.tag }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
