module.exports = {
  name: 'ping',
  description: 'Cek latency bot',
  async execute(message, args, client) {
    message.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
  }
};