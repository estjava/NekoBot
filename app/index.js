// Require the necessary discord.js classes
require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Collections untuk menyimpan commands
client.commands = new Collection();
client.queue = new Map();
client.config = {
    prefix: process.env.PREFIX || '!',
    ownerId: process.env.OWNER_ID
};

// Prefix database
client.prefixes = new Map();
let prefixData = {};
try {
    prefixData = JSON.parse(fs.readFileSync('./database/prefixes.json', 'utf8'));
} catch {
    console.log('⚠️  prefixes.json tidak ditemukan, menggunakan default kosong.');
}
Object.keys(prefixData).forEach(key => {
    client.prefixes.set(key, prefixData[key]);
});

client.savePrefix = (guildId, prefix) => {
    client.prefixes.set(guildId, prefix);
    const data = Object.fromEntries(client.prefixes);
    fs.writeFileSync('./database/prefixes.json', JSON.stringify(data, null, 2));
};

require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

client.login(process.env.DISCORD_TOKEN);