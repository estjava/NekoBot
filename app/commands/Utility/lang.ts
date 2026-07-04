import { PermissionFlagsBits, EmbedBuilder, Message, Client } from 'discord.js';

import { t, setLang, supportedLangsList,  getLang } from '../../utils/locale';

module.exports = {
  name: 'language',
  description: 'Set bot language for this server',
  category: 'Utility',
  permissions: PermissionFlagsBits.ManageGuild,
  usage: '!language [en/id]',
  aliases: ['lang', 'setlang'],
  execute(message: Message, args: string[], client: Client): Promise<unknown> | unknown {
    const guildId: string = message.guildId ?? '';

    if (!guildId) return;

    if (!args[0]) {
      const currentLang: string = getLang(guildId);
      return message.reply(
        t(guildId, 'language.current', { lang: currentLang })
      );
    }

    const newLang: string = args[0].toLowerCase();

    if (!supportedLangsList().includes(newLang)) {
      return message.reply(t(guildId, 'language.invalid'));
    }

    setLang(guildId, newLang);

    const embed: EmbedBuilder = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(t(guildId, 'language.title'))
      .setDescription(
        t(guildId, 'language.changed', {
          lang:
            newLang === 'en' ? 'English 🇬🇧' : 'Indonesia 🇮🇩',
        })
      )
      .setFooter({ text: t(guildId, 'language.footer', { user: message.author.tag }) })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};