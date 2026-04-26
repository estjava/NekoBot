require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const fs = require('node:fs');

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


// DisTube setup
client.distube = new DisTube(client, {
    ffmpeg: {
        path: require('ffmpeg-static') // ffmpeg-static
    },
    emitNewSongOnly: true,
    plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin({clientId: process.env.SOUNDCLOUD_CLIENT_ID})
    ]
});

// DisTube events
const distube = client.distube;


// Load handlers
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

client.login(process.env.DISCORD_TOKEN);