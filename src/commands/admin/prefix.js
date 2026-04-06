const fs = require('node:fs');
const path = require('node:path');

const prefixesPath = path.join(__dirname, '../../etc/prefixes.json');

module.exports = {
  name: 'prefix',
  description: 'Ganti prefix bot',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ Kamu butuh permission **Manage Server** untuk ganti prefix!');
    }

    const newPrefix = args[0];
    if (!newPrefix) return message.reply('❌ Masukkan prefix baru! Contoh: `!prefix ?`');
    if (newPrefix.length > 3) return message.reply('❌ Prefix maksimal 3 karakter!');

    const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf-8'));
    prefixes[message.guild.id] = newPrefix;
    fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));

    message.reply(`✅ Prefix berhasil diganti ke **${newPrefix}** ! Nyan~`);
  }
};