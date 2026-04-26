const { t } = require('../../utils/locale');

module.exports = {
    name: 'ping',
    description: 'Cek latency bot',
    aliases: ['p', 'latency'],
    usage: '!ping',
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const msg = await message.reply(t(guildId, 'ping.pinging'));

        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        await msg.edit(t(guildId, 'ping.pong', { latency, apiLatency }));
    }
};
