module.exports = {
    name: 'ping',
    description: 'Cek latency bot',
    aliases: ['p', 'latency'],
    usage: '!ping',
    execute(message, args, client) {
        const sent = message.reply('🏓 Pinging...');
        sent.then(msg => {
            const latency = msg.createdTimestamp - message.createdTimestamp;
            const apiLatency = Math.round(client.ws.ping);
            
            msg.edit(`🏓 Pong!\n📡 Latency: ${latency}ms\n💓 API Latency: ${apiLatency}ms`);
        });
    }
};