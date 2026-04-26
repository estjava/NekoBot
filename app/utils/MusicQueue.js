const {createAudioPlayer,createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, NoSubscriberBehavior} = require('@discordjs/voice');
const distube = require('distube');

class MusicQueue {
    constructor(guildId, voiceChannel, textChannel) {
        this.guildId = guildId;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.connection = null;
        this.player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
        });
        this.tracks = [];       // antrian lagu
        this.current = null;    // lagu yang sedang diputar
        this.volume = 1;
        this.paused = false;

        // Event: lagu selesai → putar berikutnya
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.tracks.shift();
            if (this.tracks.length > 0) {
                this.play();
            } else {
                this.current = null;
                this.textChannel.send('player.queueEmpty').catch(() => {});
                setTimeout(() => this.destroy(), 5000);
            }
        });

        this.player.on('error', (err) => {
            console.error('Player error:', err);
            this.textChannel.send('player.playError').catch(() => {});
            this.tracks.shift();
            if (this.tracks.length > 0) this.play();
            else this.destroy();
        });
    }

    async play() {
        const track = this.tracks[0];
        if (!track) return;

        // ← tambahkan ini untuk debug
        console.log('DEBUG track:', JSON.stringify(track, null, 2));

        try {
            let stream;

            if (track.source === 'youtube') {
                const info = await playdl.stream(track.url, { 
                    quality: 2,
                    discordPlayerCompatibility: true
                });
                stream = createAudioResource(info.stream, { inputType: info.type });

            } else if (track.source === 'soundcloud') {
                const info = await playdl.stream(track.url);
                stream = createAudioResource(info.stream, { inputType: info.type });

            } else if (track.source === 'spotify') {
                const searched = await playdl.search(
                    `${track.title} ${track.artist}`,
                    { source: { youtube: 'video' }, limit: 1 }
                );
                if (!searched.length || !searched[0].url) throw new Error('Tidak ditemukan di YouTube');
                
                const ytUrl = searched[0].url; // ← simpan dulu
                const info = await playdl.stream(ytUrl, { quality: 2 });
                stream = createAudioResource(info.stream, { inputType: info.type });
                track.url = ytUrl; // ← update url
            }

            this.current = track;
            this.player.play(stream);

            this.textChannel.send({
                embeds: [{
                    color: 0x1db954,
                    title: '🎵 Sedang Memutar',
                    description: `**[${track.title}](${track.url})**`,
                    fields: [
                        { name: '👤 Artis', value: track.artist || 'Unknown', inline: true },
                        { name: '⏱️ Durasi', value: track.duration || 'Unknown', inline: true },
                        { name: '🔗 Source', value: track.source.charAt(0).toUpperCase() + track.source.slice(1), inline: true },
                        { name: '📋 Ditambah oleh', value: track.requestedBy, inline: true },
                        { name: '📊 Queue', value: `${this.tracks.length} lagu tersisa`, inline: true }
                    ],
                    thumbnail: { url: track.thumbnail || '' },
                    timestamp: new Date()
                }]
            }).catch(() => {});
        } catch (err) {
            console.error('Play error:', err);
            this.textChannel.send(`❌ Gagal memutar **${track.title}**: ${err.message}`).catch(() => {});
            this.tracks.shift();
            if (this.tracks.length > 0) this.play();
            else this.destroy();
        }
    }

    skip() {
        this.player.stop();
    }

    pause() {
        if (this.paused) return false;
        this.player.pause();
        this.paused = true;
        return true;
    }

    resume() {
        if (!this.paused) return false;
        this.player.unpause();
        this.paused = false;
        return true;
    }

    stop() {
        this.tracks = [];
        this.current = null;
        this.player.stop();
        this.destroy();
    }

    destroy() {
        try {
            this.connection?.destroy();
        } catch {}
        // hapus dari map di index
        MusicQueue.queues?.delete(this.guildId);
    }

    getQueueEmbed() {
        if (!this.tracks.length) return null;
        const list = this.tracks.slice(0, 10).map((t, i) =>
            `**${i + 1}.** [${t.title}](${t.url}) — ${t.duration || '?'} | ${t.requestedBy}`
        ).join('\n');

        return {
            color: 0x1db954,
            title: '📋 Queue Lagu',
            description: list,
            footer: {
                text: `Total: ${this.tracks.length} lagu${this.tracks.length > 10 ? ` (menampilkan 10 pertama)` : ''}`
            },
            timestamp: new Date()
        };
    }
}

// Global map: guildId → MusicQueue
MusicQueue.queues = new Map();

module.exports = MusicQueue;
