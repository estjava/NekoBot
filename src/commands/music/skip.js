module.exports = {
  name: 'skip',
  description: 'Skip lagu',
  async execute(message, args, client) {
    if (!client.distube.getQueue(message)) return message.reply('❌ Tidak ada lagu yang diputar!');
    client.distube.skip(message);
    message.reply('⏭️ Lagu diskip! Nyan~');
  }
};