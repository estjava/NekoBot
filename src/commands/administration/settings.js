const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');

const settingsPath = path.join(__dirname, '../../etc/settings.json');
const prefixesPath = path.join(__dirname, '../../etc/prefixes.json');

function getSettings(guildId) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  return settings[guildId] || {};
}

function saveSettings(guildId, data) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  settings[guildId] = { ...settings[guildId], ...data };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = {
  name: 'settings',
  description: 'Lihat dan kelola pengaturan bot',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ Kamu butuh permission **Manage Server**!');
    }

    const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf-8'));
    const prefix = prefixes[message.guild.id] || '!';
    const settings = getSettings(message.guild.id);

    // !settings (tampilkan semua settings)
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setTitle('⚙️ NekoBot Settings')
        .setColor('#ff6b9d')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '📌 Prefix', value: `\`${prefix}\``, inline: true },
          { name: '📢 Log Channel', value: settings.logChannel ? `<#${settings.logChannel}>` : 'Belum diset', inline: true },
          { name: '👋 Welcome Channel', value: settings.welcomeChannel ? `<#${settings.welcomeChannel}>` : 'Belum diset', inline: true },
          { name: '👋 Welcome Message', value: settings.welcomeMessage || 'Belum diset', inline: false },
        )
        .setFooter({ text: `Gunakan ${prefix}settings <key> <value> untuk mengubah` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    const key = args[0].toLowerCase();
    const value = args.slice(1).join(' ');

    // !settings logchannel #channel
    if (key === 'logchannel') {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('❌ Tag channel! Contoh: `!settings logchannel #log`');
      saveSettings(message.guild.id, { logChannel: channel.id });
      return message.reply(`✅ Log channel diset ke ${channel}!`);
    }

    // !settings welcomechannel #channel
    if (key === 'welcomechannel') {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('❌ Tag channel! Contoh: `!settings welcomechannel #welcome`');
      saveSettings(message.guild.id, { welcomeChannel: channel.id });
      return message.reply(`✅ Welcome channel diset ke ${channel}!`);
    }

    // !settings welcomemessage <pesan>
    if (key === 'welcomemessage') {
      if (!value) return message.reply('❌ Masukkan pesan! Gunakan `{user}` untuk mention member baru.');
      saveSettings(message.guild.id, { welcomeMessage: value });
      return message.reply(`✅ Welcome message diset ke: **${value}**\n> Gunakan \`{user}\` untuk mention member baru!`);
    }

    message.reply(`❌ Setting tidak dikenali! Setting yang tersedia:\n\`logchannel\`, \`welcomechannel\`, \`welcomemessage\``);
  }
};