import fs from 'fs';
import path from 'path';
import { DATA_DIR, LOCALES_DIR } from './paths';

// Types
interface LocaleData {
    [key: string]: string | LocaleData;
}

interface LocaleVars {
    [key: string]: string | number;
}

type LangSettings = Record<string, string>;

// Load semua file bahasa di folder locales/ (en.json, id.json, ja.json, ...).
// Menambah bahasa cukup menaruh satu file JSON baru; nama file = kode bahasa.
const DEFAULT_LANG = 'en';
const locales: Record<string, LocaleData> = {};

for (const file of fs.readdirSync(LOCALES_DIR)) {
    if (!file.endsWith('.json')) continue;
    const code = file.slice(0, -'.json'.length);
    try {
        const raw = fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8').replace(/^\uFEFF/, '');
        locales[code] = JSON.parse(raw);
    } catch (err) {
        console.warn(`[locale] Skipping ${file}: ${(err as Error).message}`);
    }
}

if (!locales[DEFAULT_LANG]) {
    throw new Error(`Missing or invalid ${DEFAULT_LANG}.json in ${LOCALES_DIR} (it is the fallback language).`);
}

const langPath = path.join(DATA_DIR, 'languages.json');

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
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
}

export function supportedLangsList(): string[] {
    return Object.keys(locales).sort((a, b) => a.localeCompare(b));
}

/** Display name of a language in that language, e.g. "English", "Indonesia". Falls back to the code. */
export function languageName(code: string): string {
    try {
        const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
        if (name && name !== code) return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
    } catch {
        // not a valid language tag: use the code itself
    }
    return code;
}

/** Match user input (code or display name, any case) to a supported language code. */
export function resolveLang(input: string): string | undefined {
    const wanted = input.trim().toLowerCase();
    if (!wanted) return undefined;
    const codes = supportedLangsList();
    return (
        codes.find((c) => c.toLowerCase() === wanted) ??
        codes.find((c) => languageName(c).toLowerCase() === wanted)
    );
}

export function getLang(guildId: string): string {
    const saved = loadLangSettings()[guildId];
    // A saved language whose file was removed falls back to the default.
    return saved && locales[saved] ? saved : DEFAULT_LANG;
}

/** Returns false (and saves nothing) if the language is not supported. */
export function setLang(guildId: string, lang: string): boolean {
    if (!locales[lang]) return false;
    const settings = loadLangSettings();
    settings[guildId] = lang;
    saveLangSettings(settings);
    return true;
}

export function t(guildId: string, key: string, vars: LocaleVars = {}): string {
    const lang = getLang(guildId);
    const locale = locales[lang] || locales[DEFAULT_LANG];

    const keys = key.split('.');
    let text: string | LocaleData | undefined = locale;
    for (const k of keys) {
        text = (text as LocaleData)?.[k];
    }

    if (text === undefined || typeof text !== 'string') {
        let fallback: string | LocaleData | undefined = locales[DEFAULT_LANG];
        for (const k of keys) fallback = (fallback as LocaleData)?.[k];
        text = typeof fallback === 'string' ? fallback : key;
    }

    return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}