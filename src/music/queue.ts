import {
    AudioPlayer,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType,
    VoiceConnection,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
} from '@discordjs/voice';
import type { Guild, TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { t } from '../utils/locale';
import { Track, createStream } from './source';

export type LoopMode = 'off' | 'track' | 'queue';

const IDLE_LEAVE_MS = 3 * 60 * 1000;

export class GuildQueue {
    /** Upcoming tracks (does not include the current one). */
    tracks: Track[] = [];
    current: Track | null = null;
    loop: LoopMode = 'off';
    destroyed = false;
    readonly player: AudioPlayer;

    private endReason: 'skip' | 'error' | null = null;
    private idleTimer: NodeJS.Timeout | null = null;
    private killStream: (() => void) | null = null;

    constructor(
        readonly guildId: string,
        readonly connection: VoiceConnection,
        public textChannel: TextBasedChannel,
        private onDestroy: (guildId: string) => void
    ) {
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        connection.subscribe(this.player);

        this.player.on('stateChange', (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle) {
                this.onTrackEnd();
            }
        });
        this.player.on('error', (err) => {
            console.error(`[music:${guildId}] player error:`, err.message);
            this.endReason = 'error';
            this.notify(t(guildId, 'player.playError'));
        });

        // Reconnect if Discord moves us; clean up if we really got disconnected.
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                this.destroy();
            }
        });
        connection.on(VoiceConnectionStatus.Destroyed, () => this.destroy());
    }

    get isPlaying() {
        return this.player.state.status === AudioPlayerStatus.Playing;
    }
    get isPaused() {
        const s = this.player.state.status;
        return s === AudioPlayerStatus.Paused || s === AudioPlayerStatus.AutoPaused;
    }

    /** Add tracks; starts playback if nothing is playing. */
    async enqueue(
        tracks: Track[],
        announce = true
    ): Promise<{ startedNow: boolean; position: number }> {
        this.clearIdleTimer();
        const startedNow = !this.current;
        const position = this.tracks.length + (this.current ? 1 : 0) + 1;
        this.tracks.push(...tracks);
        if (startedNow) await this.next(announce);
        return { startedNow, position };
    }

    pause(): boolean {
        return this.player.pause();
    }
    resume(): boolean {
        return this.player.unpause();
    }

    skip(): boolean {
        if (!this.current) return false;
        this.endReason = 'skip';
        // stop() returns false if the player is already idle; advance manually then.
        if (!this.player.stop(true)) this.onTrackEnd();
        return true;
    }

    stop() {
        this.tracks = [];
        this.current = null;
        this.loop = 'off';
        this.endReason = null;
        this.player.stop(true);
        this.killStream?.();
        this.killStream = null;
        this.startIdleTimer();
    }

    shuffle() {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
    }

    /** 1-based index into the upcoming list. */
    remove(index: number): Track | null {
        if (index < 1 || index > this.tracks.length) return null;
        return this.tracks.splice(index - 1, 1)[0];
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.clearIdleTimer();
        this.tracks = [];
        this.current = null;
        this.player.stop(true);
        this.killStream?.();
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.connection.destroy();
        }
        this.onDestroy(this.guildId);
    }

    // ---- internals ----

    private onTrackEnd() {
        if (this.destroyed || !this.current) return;
        const finished = this.current;
        const reason = this.endReason;
        this.endReason = null;

        if (this.loop === 'track' && reason === null) {
            void this.start(finished, false);
            return;
        }
        // Don't recycle a track that just failed, or we could loop on errors forever.
        if (this.loop === 'queue' && reason !== 'error') this.tracks.push(finished);
        this.current = null;
        void this.next();
    }

    private async next(announce = true) {
        const track = this.tracks.shift();
        if (!track) {
            this.current = null;
            this.notify(t(this.guildId, 'player.queueFinished'));
            this.startIdleTimer();
            return;
        }
        await this.start(track, announce);
    }

    private async start(track: Track, announce: boolean) {
        this.clearIdleTimer();
        this.current = track;
        try {
            this.killStream?.();
            const { stream, kill } = createStream(track.url);
            this.killStream = kill;
            const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
            this.player.play(resource);
            if (announce) this.notify(t(this.guildId, 'player.nowPlaying', { title: track.title }));
        } catch (err) {
            console.error(`[music:${this.guildId}] failed to start track:`, err);
            this.notify(t(this.guildId, 'player.playError'));
            this.current = null;
            await this.next();
        }
    }

    private notify(text: string) {
        if (this.destroyed || !this.textChannel.isSendable()) return;
        this.textChannel.send({ content: text }).catch(() => {});
    }

    private startIdleTimer() {
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => {
            this.notify(t(this.guildId, 'player.idleLeft'));
            this.destroy();
        }, IDLE_LEAVE_MS);
    }
    private clearIdleTimer() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.idleTimer = null;
    }
}

// ---- per-server registry ----

const queues = new Map<string, GuildQueue>();

export function getQueue(guildId: string): GuildQueue | undefined {
    return queues.get(guildId);
}

export async function createQueue(
    guild: Guild,
    channel: VoiceBasedChannel,
    textChannel: TextBasedChannel
): Promise<GuildQueue> {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true,
    });
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    } catch (err) {
        connection.destroy();
        throw err;
    }
    const queue = new GuildQueue(guild.id, connection, textChannel, (id) => queues.delete(id));
    queues.set(guild.id, queue);
    return queue;
}

export function destroyQueue(guildId: string): boolean {
    const q = queues.get(guildId);
    if (!q) return false;
    q.destroy();
    return true;
}
