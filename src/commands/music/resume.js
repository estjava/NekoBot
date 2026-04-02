module.exports = {
  name: 'resume',
  description: 'Lanjutkan lagu',
  async execute(message, args, client) {
    if (!client.distube.getQueue(message)) return message.reply('❌ Tidak ada lagu yang di-pause!');
    client.distube.resume(message);
    message.reply('▶️ Lagu dilanjutkan! Nyan~');
  }
};