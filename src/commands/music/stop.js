module.exports = {
  name: 'stop',
  description: 'Stop lagu',
  async execute(message, args, client) {
    if (!client.distube.getQueue(message)) return message.reply('❌ Tidak ada lagu yang diputar!');
    client.distube.stop(message);
    message.reply('⏹️ Lagu dihentikan! Nyan~');
  }
};