const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const settingsPath = path.join(__dirname, '../etc/settings.json');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const guildSettings = settings[member.guild.id];
    if (!guildSettings?.welcomeChannel) return;

    const channel = member.guild.channels.cache.get(guildSettings.welcomeChannel);
    if (!channel) return;

    const msg = (guildSettings.welcomeMessage || 'Selamat datang {user} di **{server}**! Nyan~ 🐱')
      .replace('{user}', member)
      .replace('{server}', member.guild.name);

    channel.send(msg);
  }
};