const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const locales = {};
const supportedLangs = ['en', 'id'];

for (const lang of supportedLangs) {
    locales[lang] = JSON.parse(
        fs.readFileSync(path.join(__dirname, `../locales/${lang}.json`), 'utf8')
    );
}

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

function getLang(guildId) {
    const settings = loadLangSettings();
    return settings[guildId] || 'en';
}

function setLang(guildId, lang) {
    const settings = loadLangSettings();
    settings[guildId] = lang;
    saveLangSettings(settings);
}

function t(guildId, key, vars = {}) {
    const lang = getLang(guildId);
    const locale = locales[lang] || locales['en'];

    const keys = key.split('.');
    let text = locale;
    for (const k of keys) {
        text = text?.[k];
    }

    if (!text) {
        let fallback = locales['en'];
        for (const k of keys) fallback = fallback?.[k];
        text = fallback || key;
    }

    return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

// Helper embed untuk salah penggunaan command
function usageEmbed(guildId, command, prefix) {
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

module.exports = { t, getLang, setLang, supportedLangs, usageEmbed };
