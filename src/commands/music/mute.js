module.exports = {
  name: 'mute',
  description: 'Mute member',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers'))
      return message.reply('❌ Kamu tidak punya permission untuk mute!');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Tag member! Contoh: `!mute @user 10`');
    const durasi = parseInt(args[1]) || 5;
    try {
      await target.timeout(durasi * 60 * 1000);
      if (target.voice.channel) {
        await target.voice.setMute(true);
        await target.voice.setDeaf(true);
      }
      message.reply(`🔇 **${target.user.username}** di-mute selama **${durasi} menit**! Nyan~`);
    } catch (err) {
      message.reply('❌ Gagal mute! Pastikan role bot lebih tinggi dari target.');
    }
  }
};