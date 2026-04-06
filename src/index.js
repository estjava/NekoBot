// Require the necessary discord.js classes
// const { DISCORD_TOKEN } = require('../config.json');
require('dotenv').config();
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

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

// Bot Login Console Log
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Login as ${readyClient.user.tag}`);
});

// Collections untuk menyimpan commands
client.commands = new Collection();
client.config = require('../config.json');

// Load handlers



// Bot Login Token
// client.login(DISCORD_TOKEN);
client.login(process.env.DISCORD_TOKEN);