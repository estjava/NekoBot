import { Client, ActivityType } from 'discord.js';

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client: Client) {
        console.log(`🤖 ${client.user?.tag} is online!`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers`);

        client.user?.setPresence({
            activities: [{
                name: `Serving ${client.guilds.cache.size} servers`,
                type: ActivityType.Playing  // type: 0 → ActivityType.Playing
            }],
            status: 'online'
        });
    }
};