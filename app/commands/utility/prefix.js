const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t, usageEmbed } = require('../../utils/locale');

module.exports = {
    name: 'prefix',
    description: 'Lihat atau ubah prefix bot',
    category: 'Utility',
    permissions: PermissionFlagsBits.ManageGuild,
    usage: '!prefix [new_prefix]',
    aliases: ['setprefix', 'changeprefix'],
    examples: [
        '!prefix',
        '!prefix ?',
        '!prefix neko!'
    ],
    execute(message, args, client) {
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;

        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(t(guildId, 'prefix.title'))
                .setDescription(t(guildId, 'prefix.current', { prefix }))
                .addFields({
                    name: t(guildId, 'prefix.howToChange'),
                    value: t(guildId, 'prefix.howToChangeValue', { prefix })
                })
                .setFooter({ text: t(guildId, 'prefix.server', { guild: message.guild.name }) })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const newPrefix = args[0];

        if (newPrefix.length > 5) {
            return message.reply({
                content: t(guildId, 'prefix.tooLong'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        if (newPrefix.includes(' ')) {
            return message.reply({
                content: t(guildId, 'prefix.hasSpace'),
                embeds: [usageEmbed(guildId, module.exports, prefix)]
            });
        }

        client.savePrefix(guildId, newPrefix);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(t(guildId, 'prefix.changed'))
            .setDescription(t(guildId, 'prefix.oldPrefix', { old: prefix, new: newPrefix }))
            .addFields({
                name: t(guildId, 'prefix.example'),
                value: `\`${newPrefix}help\`\n\`${newPrefix}ping\`\n\`${newPrefix}userinfo\``
            })
            .setFooter({ text: t(guildId, 'prefix.changedBy', { user: message.author.tag }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
