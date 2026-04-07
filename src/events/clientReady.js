module.exports = {
    name: 'clientReady',  // ← Ganti dari 'ready' ke 'clientReady'
    once: true,
    execute(client) {
        console.log(`🤖 ${client.user.tag} is online!`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers`);
        
        // Set status
        client.user.setPresence({
            activities: [{ name: '!help untuk bantuan', type: 0 }],
            status: 'online'
        });
    }
};