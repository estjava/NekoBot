import { Message, Client } from 'discord.js';
import { t } from './../../utils/locale';

export default {
    name: 'ping',
    description: 'Check bot latency',
    category: 'Utility',
    usage: '!ping',
    aliases: [] as string[],
    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const guildId = message.guild.id;

        const msg = await message.reply(t(guildId, 'ping.pinging'));

        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        await msg.edit(t(guildId, 'ping.pong', { latency, apiLatency }));
    }
};