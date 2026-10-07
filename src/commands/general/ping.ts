import { Message, Client, EmbedBuilder } from 'discord.js';
import { t } from '../../utils/locale';

export default {
    name: 'Ping',
    description: 'Check bot latency',
    category: 'General',
    usage: '!ping',
    aliases: [] as string[],
    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const guildId = message.guild.id;

        // Round-trip: time between the user's message and our reply being sent
        const sent = await message.reply('🏓 Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        const color = (ms: number) => (ms < 200 ? 0x57F287 : ms < 500 ? 0xFEE75C : 0xED4245);

        const embed = new EmbedBuilder()
            .setColor(color(Math.max(latency, apiLatency)))
            .setTitle(`${client.user?.tag}`)
            .addFields(
                { name: ':stopwatch: Latency', value: `${latency}ms`, inline: true },
                { name: ':heartpulse: API', value: apiLatency >= 0 ? `${apiLatency}ms` : 'N/A', inline: true }
            )
            .setTimestamp();

        await sent.edit({ content: '', embeds: [embed] });
    }
};