module.exports = {
  name: 'pause',
  description: 'Pause lagu',
  async execute(message, args, client) {
    if (!client.distube.getQueue(message)) return message.reply('❌ Tidak ada lagu yang diputar!');
    client.distube.pause(message);
    message.reply('⏸️ Lagu di-pause! Nyan~');
  }
};