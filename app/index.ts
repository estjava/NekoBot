import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'node:fs';
import './handlers/command';
import './handlers/event';

// Extend Client type untuk custom properties
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>;
        config: {
            prefix: string;
            ownerId: string | undefined;
        };
        prefixes: Map<string, string>;
        savePrefix(guildId: string, prefix: string): void;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.config = {
    prefix: process.env.PREFIX || '!',
    ownerId: process.env.OWNER_ID
};

// Prefix database
client.prefixes = new Map();
let prefixData: Record<string, string> = {};
try {
    prefixData = JSON.parse(fs.readFileSync('./database/prefixes.json', 'utf8'));
} catch {
    console.log('⚠️  prefixes.json tidak ditemukan, menggunakan default kosong.');
}
Object.keys(prefixData).forEach(key => {
    client.prefixes.set(key, prefixData[key]);
});

client.savePrefix = (guildId: string, prefix: string): void => {
    client.prefixes.set(guildId, prefix);
    const data = Object.fromEntries(client.prefixes);
    fs.writeFileSync('./database/prefixes.json', JSON.stringify(data, null, 2));
};

// Load handlers
require('./handlers/command')(client);
require('./handlers/event')(client);

client.login(process.env.DISCORD_TOKEN);