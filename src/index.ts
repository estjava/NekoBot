import 'dotenv/config';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { DATA_DIR } from './utils/paths';
import { readJsonObject, writeJsonAtomic } from './utils/jsonFile';



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

client.on(Events.Error, (err) => console.error('[client]', err));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

client.commands = new Collection();
client.config = {
    prefix: process.env.PREFIX || '!',
    ownerId: process.env.OWNER_ID
};

const prefixPath = path.join(DATA_DIR, 'prefixes.json');

client.prefixes = new Map();
// A damaged prefixes.json is backed up (not silently replaced), see utils/jsonFile.ts
const prefixData = readJsonObject<Record<string, unknown>>(prefixPath);
for (const [key, value] of Object.entries(prefixData)) {
    if (typeof value === 'string') client.prefixes.set(key, value);
}

client.savePrefix = (guildId: string, prefix: string): void => {
    client.prefixes.set(guildId, prefix);
    writeJsonAtomic(prefixPath, Object.fromEntries(client.prefixes));
};

import loadCommands from './handlers/command';
import loadEvents from './handlers/event';

loadCommands(client);
loadEvents(client);

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('DISCORD_TOKEN is missing. Put it in the .env file.');
    process.exit(1);
}
client.login(token).catch((err) => {
    console.error('Login failed:', (err as Error).message);
    process.exit(1);
});