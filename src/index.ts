import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';



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

const prefixPath = path.join(__dirname, 'utils/database/prefixes.json');

client.prefixes = new Map();
let prefixData: Record<string, string> = {};
try {
    prefixData = JSON.parse(fs.readFileSync(prefixPath, 'utf8'));
} catch {
    console.log('⚠️  Error reading prefixes.json.');
}
Object.keys(prefixData).forEach(key => {
    client.prefixes.set(key, prefixData[key]);
});

client.savePrefix = (guildId: string, prefix: string): void => {
    client.prefixes.set(guildId, prefix);
    const data = Object.fromEntries(client.prefixes);
    fs.writeFileSync(prefixPath, JSON.stringify(data, null, 2));
};

import loadCommands from './handlers/command';
import loadEvents from './handlers/event';

loadCommands(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN);