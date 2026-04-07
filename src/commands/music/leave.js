// const { getVoiceConnection } = require('@discordjs/voice');
const { getVoiceConnection} = require('discord.js');

module.exports = {
  name: 'leave',
  description: 'Bot keluar dari voice channel',
  async execute(message, args, client) {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply('NekoBot tidak ada di voice channel!');

    try {
      connection.destroy();
      message.reply('NekoBot keluar dari voice channel! Nyan~ ');
    } catch (err) {
      console.error(err);
      message.reply('Gagal keluar dari voice channel!');
    }
  }
};