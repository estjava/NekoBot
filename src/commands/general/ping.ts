import { Message, Client, EmbedBuilder } from 'discord.js';
import { t } from '../../utils/locale';

export default {
    name: 'ping',
    description: 'Check bot latency',
    category: 'General',
    usage: '!ping',
    aliases: [] as string[],
    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const guildId = message.guild.id;

        const latency = message.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(latency < 200 ? 0x57F287 : latency < 500 ? 0xFEE75C : 0xED4245)
            .setTitle(`${client.user?.tag}`)
            .addFields(
                { name: ':heartpulse: Heartbeat', value: `${latency}ms`, inline: true },
                { name: ':stopwatch: API', value: latency !== null ? `${apiLatency}ms` : 'N/A', inline: true }
                )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};