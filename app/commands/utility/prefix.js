const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t } = require('../../utils/locale');

module.exports = {
    name: 'prefix',
    description: 'Lihat atau ubah prefix bot',
    category: 'Utility',
    permissions: PermissionFlagsBits.ManageGuild,
    usage: '!prefix [new_prefix]',
    aliases: ['setprefix', 'changeprefix'],
    execute(message, args, client) {
        const guildId = message.guild.id;
        const currentPrefix = client.prefixes.get(guildId) || client.config.prefix;

        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(t(guildId, 'prefix.title'))
                .setDescription(t(guildId, 'prefix.current', { prefix: currentPrefix }))
                .addFields({
                    name: t(guildId, 'prefix.howToChange'),
                    value: t(guildId, 'prefix.howToChangeValue', { prefix: currentPrefix })
                })
                .setFooter({ text: t(guildId, 'prefix.server', { guild: message.guild.name }) })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const newPrefix = args[0];

        if (newPrefix.length > 5) {
            return message.reply(t(guildId, 'prefix.tooLong'));
        }

        if (newPrefix.includes(' ')) {
            return message.reply(t(guildId, 'prefix.hasSpace'));
        }

        client.savePrefix(guildId, newPrefix);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(t(guildId, 'prefix.changed'))
            .setDescription(t(guildId, 'prefix.oldPrefix', { old: currentPrefix, new: newPrefix }))
            .addFields({
                name: t(guildId, 'prefix.example'),
                value: `\`${newPrefix}help\`\n\`${newPrefix}ping\`\n\`${newPrefix}userinfo\``
            })
            .setFooter({ text: t(guildId, 'prefix.changedBy', { user: message.author.tag }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });
        console.log(`🔧 Prefix changed in ${message.guild.name} (${guildId}): ${currentPrefix} → ${newPrefix}`);
    }
};
