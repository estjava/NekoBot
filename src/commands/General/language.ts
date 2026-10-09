import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t, getLang, setLang, supportedLangsList, languageName, resolveLang } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';

// "Indonesia (id)"
const label = (code: string): string => `${languageName(code)} (${code})`;
// "`en` English, `id` Indonesia" (daftar dibaca dari folder locales/, bukan ditulis manual)
const listLangs = (): string =>
    supportedLangsList().map((c) => `\`${c}\` ${languageName(c)}`).join(', ');

export default {
    name: 'Language',
    description: 'Shows or changes the bot language for this server.',
    usage: ['!language [code]'],
    aliases: ['lang'],
    category: 'General',
    examples: ['!language', '!language id'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const prefix = client.prefixes.get(gid) || client.config.prefix;
        const input = args.join(' ').trim();

        // No argument: show current language and the available ones (anyone can do this)
        if (!input) {
            const text =
                `${t(gid, 'language.current', { lang: label(getLang(gid)) })}\n` +
                t(gid, 'language.available', { list: listLangs(), prefix });
            return say(message, text);
        }

        // Changing it needs Manage Server, same as !prefix
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return say(message, t(gid, 'language.noPermission'), COLORS.error);
        }

        const code = resolveLang(input);
        if (!code || !setLang(gid, code)) {
            return say(message, t(gid, 'language.invalid', { list: listLangs() }), COLORS.error);
        }

        // t() now reads the new language, so the confirmation is already in it
        return say(message, t(gid, 'language.changed', { lang: label(code) }), COLORS.success);
    },
};
