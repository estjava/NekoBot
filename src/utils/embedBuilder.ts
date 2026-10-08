import { EmbedBuilder, Message } from 'discord.js';

/** Satu-satunya tempat warna embed didefinisikan. */
export const COLORS = {
    default: 0x5865F2,
    success: 0x57F287,
    error: 0xED4245,
    warn: 0xFEE75C,
} as const;

/** Embed berisi deskripsi saja (tanpa judul/footer/timestamp). */
export function descEmbed(text: string, color: number = COLORS.default): EmbedBuilder {
    return new EmbedBuilder().setColor(color).setDescription(text);
}

/** Balas sebuah pesan dengan embed deskripsi. */
export function say(message: Message, text: string, color: number = COLORS.default) {
    return message.reply({ embeds: [descEmbed(text, color)] });
}
