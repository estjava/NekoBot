module.exports = {
  name: 'play',
  description: 'Putar lagu',
  async execute(message, args, client) {
    const query = args.join(' ');
    if (!query) return message.reply('❌ Masukkan judul atau link! Contoh: `!play Naruto opening`');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Masuk Voice Channel dulu!');
    try {
      await client.distube.play(voiceChannel, query, {
        textChannel: message.channel,
        member: message.member,
      });
    } catch (err) {
      message.reply('❌ Gagal memutar: ' + err.message);
    }
  }
};