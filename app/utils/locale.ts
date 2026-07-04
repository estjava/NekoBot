import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';

// Types
interface LocaleData {
    [key: string]: string | LocaleData;
}

interface LocaleVars {
    [key: string]: string | number;
}

interface CommandMeta {
    name: string;
    usage?: string;
    examples?: string[];
}

type LangSettings = Record<string, string>;

// Load semua locale file
const locales: Record<string, LocaleData> = {};
const supportedLangs: string[] = ['en', 'id'];



for (const lang of supportedLangs) {
    locales[lang] = JSON.parse(
        fs.readFileSync(path.join(__dirname, `../locales/${lang}.json`), 'utf8')
    );
}

const langPath = path.join(__dirname, '../database/languages.json');

function loadLangSettings(): LangSettings {
    try {
        return JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch {
        return {};
    }
}

function saveLangSettings(data: LangSettings): void {
    fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
}

export function supportedLangsList(): string[] {
    return supportedLangs;
}

export function getLang(guildId: string): string {
    const settings = loadLangSettings();
    return settings[guildId] || 'en';
}

export function setLang(guildId: string, lang: string): void {
    const settings = loadLangSettings();
    settings[guildId] = lang;
    saveLangSettings(settings);
}

export function t(guildId: string, key: string, vars: LocaleVars = {}): string {
    const lang = getLang(guildId);
    const locale = locales[lang] || locales['en'];

    const keys = key.split('.');
    let text: string | LocaleData | undefined = locale;
    for (const k of keys) {
        text = (text as LocaleData)?.[k];
    }

    if (!text) {
        let fallback: string | LocaleData | undefined = locales['en'];
        for (const k of keys) fallback = (fallback as LocaleData)?.[k];
        text = (fallback as string) || key;
    }

    return (text as string).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function usageEmbed(guildId: string, command: CommandMeta, prefix?: string): EmbedBuilder {
    const p = prefix || '!';
    const usage = command.usage?.replace('!', p) || `${p}${command.name}`;
    const examples = command.examples?.map(e => `\`${e.replace('!', p)}\``).join('\n') || null;

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(t(guildId, 'common.error'))
        .addFields({ name: t(guildId, 'common.Usage'), value: `\`${usage}\`` });

    if (examples) {
        embed.addFields({ name: t(guildId, 'common.examples'), value: examples });
    }

    embed.setFooter({ text: t(guildId, 'common.tryAgain') });

    return embed;
}

module.exports = { t, getLang, setLang, supportedLangsList, usageEmbed };