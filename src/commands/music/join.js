// const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { joinVoiceChannel, getVoiceConnection} = require('discord.js');

module.exports = {
  name: 'join',
  description: 'Bot masuk ke voice channel',
  async execute(message, args, client) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Kamu harus masuk Voice Channel dulu!');

    const existingConnection = getVoiceConnection(message.guild.id);
    if (existingConnection) return message.reply(`NekoBot sudah ada di voice channel!`);

    try {
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      message.reply(`NekoBot masuk ke **${voiceChannel.name}**! Nyan~`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Gagal masuk voice channel!');
    }
  }
};