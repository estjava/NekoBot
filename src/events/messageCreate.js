const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const prefixesPath = path.join(__dirname, '../etc/prefixes.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return;

    // Ambil prefix dari file, default '!'
    const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf-8'));
    const prefix = prefixes[message.guild?.id] || '!';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('❌ Terjadi error saat menjalankan command!');
    }
  }
};