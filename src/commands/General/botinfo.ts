import fs from 'node:fs';
import path from 'node:path';
import { Client, EmbedBuilder, Message, version as djsVersion } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS } from '../../utils/embedBuilder';
import { ROOT_DIR } from '../../utils/paths';

// Read once at startup. package.json sits in the project root in both dev (src) and start (dist) mode.
let BOT_VERSION = 'unknown';
try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    BOT_VERSION = pkg.version ?? BOT_VERSION;
} catch {
    // keep "unknown"
}

/** 93784 seconds -> "1d 2h 3m 4s" (language-neutral, so it needs no translation). */
function formatUptime(totalSeconds: number): string {
    const s = Math.floor(totalSeconds);
    const parts = [
        [Math.floor(s / 86400), 'd'],
        [Math.floor((s % 86400) / 3600), 'h'],
        [Math.floor((s % 3600) / 60), 'm'],
        [s % 60, 's'],
    ] as const;
    const shown = parts.filter(([n]) => n > 0).map(([n, unit]) => `${n}${unit}`);
    return shown.length ? shown.join(' ') : '0s';
}

export default {
    name: 'BotInfo',
    description: 'Shows statistics about the bot.',
    usage: ['!botinfo'],
    aliases: ['about', 'stats'],
    category: 'General',
    examples: ['!botinfo'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        const servers = client.guilds.cache.size;
        const ping = Math.round(client.ws.ping);
        const memory = `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`;
        const engine = process.version;

        const embed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(client.user?.username ?? 'NekoBot')
            .addFields(
                { name: t(gid, 'botinfo.version'), value: BOT_VERSION, inline: true },
                { name: t(gid, 'botinfo.servers'), value: String(servers), inline: true },
                { name: t(gid, 'botinfo.commands'), value: String(client.commands.size), inline: true },
                { name: t(gid, 'botinfo.uptime'), value: formatUptime(process.uptime()), inline: true },
                { name: t(gid, 'botinfo.library'), value: `discord.js v${djsVersion}`, inline: true },
                { name: t(gid, 'botinfo.engine'), value: `Node.js ${process.version}`, inline: true }
            )
            .setTimestamp();

        const avatar = client.user?.displayAvatarURL();
        if (avatar) embed.setThumbnail(avatar);

        return message.reply({ embeds: [embed] });
    },
};
