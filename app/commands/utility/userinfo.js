const { EmbedBuilder } = require('discord.js');
const { t, usageEmbed } = require('../../utils/locale');

module.exports = {
    name: 'userinfo',
    description: 'Informasi tentang user',
    aliases: ['ui'],
    usage: '!userinfo @user',
    examples: [
        '!userinfo @user'
    ],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;

        // Wajib mention
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply({
                content: t(guildId, 'userinfo.noMention'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        // Fetch member, error jika tidak ada di server
        let member;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch {
            return message.reply(t(guildId, 'userinfo.notInServer'));
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(t(guildId, 'userinfo.title', { tag: user.tag }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: t(guildId, 'userinfo.userId'), value: user.id, inline: true },
                { name: t(guildId, 'userinfo.accountCreated'), value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: t(guildId, 'userinfo.joinedServer'), value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                {
                    name: t(guildId, 'userinfo.roles'),
                    value: member.roles.cache.map(r => r).join(', ').replace('@everyone', '') || t(guildId, 'userinfo.noRoles'),
                    inline: false
                }
            )
            .setFooter({ text: t(guildId, 'userinfo.requestedBy', { user: message.author.tag }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};