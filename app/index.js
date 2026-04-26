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
        path: require('ffmpeg-static') // ← pakai ffmpeg-static
    },
    emitNewSongOnly: true,
    plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin()
    ]
});

// DisTube events
const distube = client.distube;

distube.on('playSong', (queue, song) => {
    queue.textChannel?.send({
        embeds: [{
            color: 0x1db954,
            title: '🎵 Sedang Memutar',
            description: `**[${song.name}](${song.url})**`,
            fields: [
                { name: '👤 Artis', value: song.uploader?.name || 'Unknown', inline: true },
                { name: '⏱️ Durasi', value: song.formattedDuration || '?', inline: true },
                { name: '🔗 Source', value: song.source || 'youtube', inline: true },
                { name: '📋 Ditambah oleh', value: song.member?.user.tag || 'Unknown', inline: true },
                { name: '📊 Queue', value: `${queue.songs.length} lagu tersisa`, inline: true }
            ],
            thumbnail: { url: song.thumbnail || '' },
            timestamp: new Date()
        }]
    }).catch(() => {});
});

distube.on('addSong', (queue, song) => {
    queue.textChannel?.send({
        embeds: [{
            color: 0x0099ff,
            title: '➕ Ditambahkan ke Queue',
            description: `**[${song.name}](${song.url})**`,
            fields: [
                { name: '⏱️ Durasi', value: song.formattedDuration || '?', inline: true },
                { name: '📊 Posisi', value: `#${queue.songs.length}`, inline: true }
            ],
            thumbnail: { url: song.thumbnail || '' },
            timestamp: new Date()
        }]
    }).catch(() => {});
});

distube.on('addList', (queue, playlist) => {
    queue.textChannel?.send({
        embeds: [{
            color: 0x0099ff,
            title: '📋 Playlist Ditambahkan!',
            description: `**${playlist.name}** — ${playlist.songs.length} lagu`,
            timestamp: new Date()
        }]
    }).catch(() => {});
});

distube.on('finish', queue => {
    queue.textChannel?.send('✅ Queue sudah habis!').catch(() => {});
});

distube.on('error', (error, queue) => {
    console.error('DisTube error:', error);
    queue?.textChannel?.send(`❌ Error: ${error.message}`).catch(() => {});
});

distube.on('disconnect', queue => {
    queue.textChannel?.send('👋 Bot keluar dari voice channel.').catch(() => {});
});

// Load handlers
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

client.login(process.env.DISCORD_TOKEN);