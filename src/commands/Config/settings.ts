import { Client, EmbedBuilder, Message } from 'discord.js';
import { t, getLang, languageName } from '../../utils/locale';
import { COLORS } from '../../utils/embedBuilder';
import { getSettings, idleMinutes } from '../../utils/settings';

export default {
    name: 'Settings',
    description: 'Shows all bot settings for this server.',
    usage: ['!settings'],
    aliases: ['config', 'cfg'],
    category: 'Config',
    examples: ['!settings'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const guild = message.guild;
        const gid = guild.id;
        const prefix = client.prefixes.get(gid) || client.config.prefix;

        const lang = getLang(gid);
        const stay = getSettings(gid).stay247 === true;

        // Other Config commands, so this list follows whatever commands exist.
        const changeWith = client.commands
            .filter((c: { category?: string; name: string }) => c.category === 'Config' && c.name.toLowerCase() !== 'settings')
            .map((c: { name: string }) => `\`${prefix}${c.name.toLowerCase()}\``)
            .join(' ');

        const embed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(t(gid, 'settings.title', { guild: guild.name }))
            .setDescription(t(gid, 'settings.changeWith', { commands: changeWith }))
            .addFields(
                { name: t(gid, 'settings.prefix'), value: `\`${prefix}\``, inline: true },
                { name: t(gid, 'settings.language'), value: `${languageName(lang)} (${lang})`, inline: true },
                { name: t(gid, 'settings.stay'), value: t(gid, stay ? 'settings.on' : 'settings.off'), inline: true },
                { name: t(gid, 'settings.idle'), value: t(gid, 'settings.minutes', { minutes: idleMinutes(gid) }), inline: true }
            );

        return message.reply({ embeds: [embed] });
    },
};
