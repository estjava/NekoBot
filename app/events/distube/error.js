module.exports = {
    name: 'error',
    execute(error, queue, client) {
        console.error('DisTube error:', error);

        if (error.errorCode === 'SOUNDCLOUD_PLUGIN_RATE_LIMITED') {
            queue?.textChannel?.send(
                '❌ SoundCloud sedang rate limited! Coba lagi beberapa menit atau gunakan link YouTube.'
            ).catch(() => {});
            queue?.skip().catch(() => queue?.stop().catch(() => {}));
            return;
        }

        queue?.textChannel?.send(`❌ Error: ${error.message}`).catch(() => {});
    }
};
