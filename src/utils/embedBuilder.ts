import { EmbedBuilder } from 'discord.js';
import { t } from './locale';

export const COLORS = {
    default: '#5865F2',
    success: '#57F287',
    error: '#ED4245',
    warn: '#FEE75C',
} as const;

interface CommandMeta {
    name: string;
    usage?: string;
    examples?: string[];
}

function baseEmbed(): EmbedBuilder {
    return new EmbedBuilder().setColor(COLORS.default).setTimestamp();
}

export const embeds = {
    success: (title: string, description: string): EmbedBuilder =>
        baseEmbed().setColor(COLORS.success).setTitle(`✅ ${title}`).setDescription(description),

    error: (title: string, description: string): EmbedBuilder =>
        baseEmbed().setColor(COLORS.error).setTitle(`❌ ${title}`).setDescription(description),

    warn: (title: string, description: string): EmbedBuilder =>
        baseEmbed().setColor(COLORS.warn).setTitle(`⚠️ ${title}`).setDescription(description),

    info: (title: string, description: string): EmbedBuilder =>
        baseEmbed().setColor(COLORS.default).setTitle(title).setDescription(description),
};

export function usageEmbed(guildId: string, command: CommandMeta, prefix?: string): EmbedBuilder {
    const p = prefix || '!';
    const usage = command.usage?.replaceAll('!', p) || `${p}${command.name}`;
    const examples = command.examples?.map(e => `\`${e.replaceAll('!', p)}\``).join('\n') || null;

    const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(t(guildId, 'common.error'))
        .addFields({ name: t(guildId, 'common.Usage'), value: `\`${usage}\`` });

    if (examples) {
        embed.addFields({ name: t(guildId, 'common.examples'), value: examples });
    }

    embed.setFooter({ text: t(guildId, 'common.tryAgain') });

    return embed;
}