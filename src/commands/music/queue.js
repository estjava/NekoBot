module.exports = {
  name: 'queue',
  description: 'Lihat antrian lagu',
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.reply('❌ Queue kosong!');
    const q = queue.songs.map((song, i) =>
      `${i === 0 ? '▶️' : `${i}.`} **${song.name}** | \`${song.formattedDuration}\``
    ).join('\n');
    message.reply(`🎵 **Queue:**\n${q}`);
  }
};