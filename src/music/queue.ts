import { log } from '../utils/logger';
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
import { COLORS, descEmbed } from '../utils/embedBuilder';
import { getSettings, idleMinutes } from '../utils/settings';

export type LoopMode = 'off' | 'track' | 'queue';

// A track that ends sooner than this did not really play (yt-dlp failed, ffmpeg got an empty stream).
const MIN_PLAY_MS = 1500;

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
    private streamToken: symbol | null = null;
    private startedAt = 0;

    constructor(
        readonly guildId: string,
        readonly connection: VoiceConnection,
        public textChannel: TextBasedChannel,
        private onDestroy: (queue: GuildQueue) => void
    ) {
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        connection.subscribe(this.player);

        this.player.on('stateChange', (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle) {
                this.onTrackEnd();
            }
        });
        this.player.on('error', (err) => {
            log.error(`[music:${guildId}] player error:`, err.message);
            this.endReason = 'error';
            this.notify(t(guildId, 'player.playError'), COLORS.error);
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
        this.onDestroy(this);
    }

    /** Re-evaluate the idle timer after !247 or !idletime changed. */
    refreshIdleTimer() {
        if (this.destroyed || this.current) return;
        this.startIdleTimer();
    }

    // ---- internals ----

    private onTrackEnd() {
        if (this.destroyed || !this.current) return;
        const finished = this.current;
        let reason = this.endReason;
        this.endReason = null;

        // Ended almost at once = it never really played. Count it as an error, otherwise the loop
        // modes would retry a broken track forever (and hammer YouTube while doing so).
        if (reason === null && Date.now() - this.startedAt < MIN_PLAY_MS) reason = 'error';

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
            const stay = getSettings(this.guildId).stay247;
            this.notify(t(this.guildId, stay ? 'player.queueFinishedStay' : 'player.queueFinished'));
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
            const token = Symbol('stream');
            this.streamToken = token;
            this.startedAt = Date.now();
            const { stream, kill } = createStream(track.url, (reason) => {
                // The real cause goes to the log; the channel only gets the generic error.
                log.error(`[music:${this.guildId}] yt-dlp failed for "${track.title}" (${track.url}): ${reason}`);
                // The empty stream is about to "end" the track normally; flag it as failed so loop modes skip it.
                if (this.streamToken === token) this.endReason = 'error';
                this.notify(t(this.guildId, 'player.playError'), COLORS.error);
            });
            this.killStream = kill;
            const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
            this.player.play(resource);
            if (announce) this.notify(t(this.guildId, 'player.nowPlaying', { title: track.title }));
        } catch (err) {
            log.error(`[music:${this.guildId}] failed to start track:`, err);
            this.notify(t(this.guildId, 'player.playError'), COLORS.error);
            this.current = null;
            await this.next();
        }
    }

    private notify(text: string, color: number = COLORS.default) {
        if (this.destroyed || !this.textChannel.isSendable()) return;
        this.textChannel.send({ embeds: [descEmbed(text, color)] }).catch(() => {});
    }

    private startIdleTimer() {
        this.clearIdleTimer();
        // 24/7 mode: never leave because of inactivity (!leave still works).
        if (getSettings(this.guildId).stay247) return;
        // Read per call, so !idletime applies without restarting the bot.
        const ms = idleMinutes(this.guildId) * 60 * 1000;
        this.idleTimer = setTimeout(() => {
            this.notify(t(this.guildId, 'player.idleLeft'));
            this.destroy();
        }, ms);
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
    // Only remove our own entry: a late destroy of an old queue must not unregister a newer one.
    const queue = new GuildQueue(guild.id, connection, textChannel, (q) => {
        if (queues.get(q.guildId) === q) queues.delete(q.guildId);
    });
    queues.set(guild.id, queue);
    return queue;
}

/** Thrown when the bot is playing for someone in another voice channel and must not be taken over. */
export class BusyElsewhereError extends Error {
    constructor() {
        super('The bot is busy in another voice channel.');
    }
}

const locks = new Map<string, Promise<unknown>>();

/** Runs `task` after every earlier task for the same server has finished (one at a time per server). */
export async function withGuildLock<T>(guildId: string, task: () => Promise<T>): Promise<T> {
    const previous = locks.get(guildId) ?? Promise.resolve();
    const run = previous.catch(() => {}).then(task);
    const tail = run.catch(() => {});
    locks.set(guildId, tail);
    try {
        return await run;
    } finally {
        if (locks.get(guildId) === tail) locks.delete(guildId);
    }
}

/**
 * The queue for this server, joined to `channel`. Reuses the running queue, or creates one.
 * Serialized per server: two quick !play commands used to each create their own queue on the same
 * voice connection, which silenced the first song and left a ghost queue that later killed the
 * connection of the real one.
 */
export function getOrCreateQueue(
    guild: Guild,
    channel: VoiceBasedChannel,
    textChannel: TextBasedChannel
): Promise<GuildQueue> {
    return withGuildLock(guild.id, async () => {
        const existing = queues.get(guild.id);
        if (existing && !existing.destroyed) {
            const botChannelId = guild.members.me?.voice.channelId;
            if (botChannelId === channel.id) {
                existing.textChannel = textChannel;
                return existing;
            }
            // Playing for others somewhere else: do not hijack the bot.
            if (botChannelId && (existing.current || existing.tracks.length)) throw new BusyElsewhereError();
            existing.destroy();
        }
        return createQueue(guild, channel, textChannel);
    });
}

export function destroyQueue(guildId: string): boolean {
    const q = queues.get(guildId);
    if (!q) return false;
    q.destroy();
    return true;
}
