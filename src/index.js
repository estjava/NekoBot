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
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ]
});

// Collections untuk menyimpan commands
client.commands = new Collection();
client.config = require('../config.json');

// Prefix database
client.prefixes = new Map();
const prefixData = JSON.parse(fs.readFileSync('./database/prefixes.json', 'utf8'));
Object.keys(prefixData).forEach(key => {
    client.prefixes.set(key, prefixData[key]);
});

// Function to save prefixes
client.savePrefix = (guildId, prefix) => {
    client.prefixes.set(guildId, prefix);
    const data = Object.fromEntries(client.prefixes);
    fs.writeFileSync('./database/prefixes.json', JSON.stringify(data, null, 2));
};

// Load handlers
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

// Bot Login Token
client.login(process.env.DISCORD_TOKEN);