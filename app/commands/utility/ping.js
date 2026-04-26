module.exports = {
    name: 'ping',
    description: 'Cek latency bot',
    aliases: ['p', 'latency'],
    usage: '!ping',

    async execute(message, args, client) {
        const msg = await message.reply('🏓 Pinging...');
        
        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        await msg.edit(`🏓 Pong!\n📡 Latency: ${latency}ms\n💓 API Latency: ${apiLatency}ms`);
    }
};