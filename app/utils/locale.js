const fs = require('fs');
const path = require('path');

const locales = {};
const supportedLangs = ['en', 'id'];

// Load semua locale saat startup
for (const lang of supportedLangs) {
    locales[lang] = JSON.parse(
        fs.readFileSync(path.join(__dirname, `../locales/${lang}.json`), 'utf8')
    );
}

// Load language settings
const langPath = path.join(__dirname, '../database/languages.json');

function loadLangSettings() {
    try {
        return JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch {
        return {};
    }
}

function saveLangSettings(data) {
    fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
}

// Ambil bahasa server
function getLang(guildId) {
    const settings = loadLangSettings();
    return settings[guildId] || 'en';
}

// Set bahasa server
function setLang(guildId, lang) {
    const settings = loadLangSettings();
    settings[guildId] = lang;
    saveLangSettings(settings);
}

// Ambil teks berdasarkan key, replace placeholder
function t(guildId, key, vars = {}) {
    const lang = getLang(guildId);
    const locale = locales[lang] || locales['en'];

    // key format: "kick.noMention"
    const keys = key.split('.');
    let text = locale;
    for (const k of keys) {
        text = text?.[k];
    }

    if (!text) {
        // Fallback ke English
        let fallback = locales['en'];
        for (const k of keys) fallback = fallback?.[k];
        text = fallback || key;
    }

    // Replace placeholder {variable}
    return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

module.exports = { t, getLang, setLang, supportedLangs };