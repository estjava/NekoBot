import { Client, ActivityType, ActivityOptions, PresenceStatusData } from 'discord.js';

// Status dibuat ulang tiap giliran, jadi angka server/member selalu terbaru
// (kode lama menghitung sekali saat start, tidak berubah kalau bot masuk server baru).
const ROTATE_EVERY_MS = 30_000; 
// jangan di bawah ~15 detik: Discord membatasi update presence
const BOT_STATUS: PresenceStatusData = 'online'; 
// 'online' | 'idle' | 'dnd' | 'invisible'

function buildActivities(client: Client): ActivityOptions[] {
    const servers = client.guilds.cache.size;
    const members = client.guilds.cache.reduce((sum, g) => sum + g.memberCount, 0);
    const prefix = client.config.prefix;

    return [
        { type: ActivityType.Watching, name: `${servers} servers` },
        { type: ActivityType.Listening, name: `${prefix}play` },
        { type: ActivityType.Playing, name: `${prefix}help | ${members} members` },
        { type: ActivityType.Custom, name: 'custom', state: '🐾 Nyaa~ ready to play music!' },
    ];
}

module.exports = {
    name: 'clientReady',
    description: 'Triggered when the bot is ready and connected to Discord.',
    once: true,
    execute(client: Client) {
        console.log(`🤖 ${client.user?.tag} is online!`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers, ${client.commands.size} commands loaded`);

        let i = 0;
        const update = () => {
            const activities = buildActivities(client);
            client.user?.setPresence({
                activities: [activities[i % activities.length]],
                status: BOT_STATUS,
            });
            i++;
        };

        update();
        setInterval(update, ROTATE_EVERY_MS);
    }
};