module.exports = {
  name: 'unmute',
  description: 'Unmute member',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers'))
      return message.reply('❌ Kamu tidak punya permission untuk unmute!');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Tag member! Contoh: `!unmute @user`');
    try {
      await target.timeout(null);
      if (target.voice.channel) {
        await target.voice.setMute(false);
        await target.voice.setDeaf(false);
      }
      message.reply(`🔊 **${target.user.username}** sudah di-unmute! Nyan~`);
    } catch (err) {
      message.reply('❌ Gagal unmute!');
    }
  }
};