import fs from 'fs';
import path from 'path';

// Types
interface LocaleData {
    [key: string]: string | LocaleData;
}

interface LocaleVars {
    [key: string]: string | number;
}

type LangSettings = Record<string, string>;

// Load semua locale file
const locales: Record<string, LocaleData> = {};
const supportedLangs: string[] = ['en', 'id'];

for (const lang of supportedLangs) {
    locales[lang] = JSON.parse(
        fs.readFileSync(path.join(__dirname, `./locales/${lang}.json`), 'utf8')
    );
}

const langPath = path.join(__dirname, './database/languages.json');

// Cache in-memory biar tidak baca file tiap kali t() dipanggil
let langSettingsCache: LangSettings;

function loadLangSettings(): LangSettings {
    if (langSettingsCache) return langSettingsCache;
    try {
        langSettingsCache = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch {
        langSettingsCache = {};
    }
    return langSettingsCache;
}

function saveLangSettings(data: LangSettings): void {
    langSettingsCache = data;
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

    if (text === undefined || typeof text !== 'string') {
        let fallback: string | LocaleData | undefined = locales['en'];
        for (const k of keys) fallback = (fallback as LocaleData)?.[k];
        text = typeof fallback === 'string' ? fallback : key;
    }

    return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}