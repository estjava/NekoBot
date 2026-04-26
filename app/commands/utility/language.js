const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { t, setLang, supportedLangs } = require('../../utils/locale');

module.exports = {
    name: 'language',
    description: 'Set bot language for this server',
    category: 'Utility',
    permissions: PermissionFlagsBits.ManageGuild,
    usage: '!language [en/id]',
    aliases: ['lang', 'setlang'],
    execute(message, args, client) {
        const guildId = message.guild.id;

        // Tampilkan bahasa saat ini jika tidak ada args
        if (!args[0]) {
            return message.reply(t(guildId, 'language.current', { lang: require('../../utils/locale').getLang(guildId) }));
        }

        const newLang = args[0].toLowerCase();

        if (!supportedLangs.includes(newLang)) {
            return message.reply(t(guildId, 'language.invalid'));
        }

        setLang(guildId, newLang);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(t(guildId, 'language.title'))
            .setDescription(t(guildId, 'language.changed', { lang: newLang === 'en' ? 'English 🇬🇧' : 'Indonesia 🇮🇩' }))
            .setFooter({ text: t(guildId, 'language.footer', { user: message.author.tag }) })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};