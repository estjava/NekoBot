import { spawn } from 'node:child_process';
import { Transform, type Readable } from 'node:stream';

// yt-dlp must be installed and on PATH (or set YTDLP_PATH in .env)
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const MAX_PLAYLIST = Number(process.env.MAX_PLAYLIST) || 50;
const RESOLVE_TIMEOUT_MS = 30_000;

export interface Track {
    title: string;
    url: string;
    /** seconds, 0 = unknown / live */
    duration: number;
    requestedBy: string;
}

export type Resolved =
    | { kind: 'track'; track: Track }
    | { kind: 'playlist'; name: string; tracks: Track[] };

export class SourceError extends Error {
    constructor(public code: 'MISSING' | 'FAILED' | 'NOT_FOUND', message: string) {
        super(message);
    }
}

function runJson(args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        const proc = spawn(YTDLP, args, { windowsHide: true });
        let out = '';
        let err = '';
        const timer = setTimeout(() => proc.kill(), RESOLVE_TIMEOUT_MS);

        proc.stdout.on('data', (d) => (out += d));
        proc.stderr.on('data', (d) => (err += d));
        proc.on('error', (e: NodeJS.ErrnoException) => {
            clearTimeout(timer);
            reject(
                e.code === 'ENOENT'
                    ? new SourceError('MISSING', 'yt-dlp was not found. Install it or set YTDLP_PATH.')
                    : e
            );
        });
        proc.on('close', (code) => {
            clearTimeout(timer);
            if (code !== 0) {
                const line = err.trim().split('\n').pop() || 'yt-dlp failed';
                return reject(new SourceError('FAILED', line));
            }
            try {
                resolve(JSON.parse(out));
            } catch {
                reject(new SourceError('FAILED', 'Invalid output from yt-dlp.'));
            }
        });
    });
}

function toTrack(info: any, requestedBy: string): Track | null {
    const url: string | undefined =
        info.webpage_url || (/^https?:\/\//.test(info.url ?? '') ? info.url : undefined) ||
        (info.id ? `https://www.youtube.com/watch?v=${info.id}` : undefined);
    if (!url) return null;
    return {
        title: info.title || 'Unknown title',
        url,
        duration: Number(info.duration) || 0,
        requestedBy,
    };
}

function isPlaylistUrl(q: string): boolean {
    if (!/^https?:\/\//i.test(q)) return false;
    // "Play mix" links explicitly ask for the whole radio list
    if (/[?&]start_radio=1/i.test(q) && /[?&]list=/i.test(q)) return true;
    if (/youtu\.be\//i.test(q)) return false;
    return /\/playlist\?/i.test(q) || (/[?&]list=/i.test(q) && !/[?&]v=/i.test(q));
}

/** Resolve a search query or URL into one track or a playlist. */
export async function resolve(
    query: string,
    requestedBy: string,
    forcePlaylist = false
): Promise<Resolved> {
    const base = ['--dump-single-json', '--flat-playlist', '--no-warnings'];

    // forcePlaylist: the user passed --playlist, so load the whole list even if the link has v=
    if ((forcePlaylist && /^https?:\/\//i.test(query) && /[?&]list=/i.test(query)) || isPlaylistUrl(query)) {
        const info = await runJson([...base, '--playlist-end', String(MAX_PLAYLIST), query]);
        const tracks = ((info.entries ?? []) as any[])
            .map((e) => toTrack(e, requestedBy))
            .filter((t): t is Track => t !== null);
        if (!tracks.length) throw new SourceError('NOT_FOUND', 'Playlist is empty.');
        return { kind: 'playlist', name: info.title || 'Playlist', tracks };
    }

    const isUrl = /^https?:\/\//i.test(query);
    const info = await runJson([...base, '--no-playlist', isUrl ? query : `ytsearch1:${query}`]);
    const entry = info.entries ? info.entries[0] : info;
    const track = entry ? toTrack(entry, requestedBy) : null;
    if (!track) throw new SourceError('NOT_FOUND', 'No results.');
    return { kind: 'track', track };
}

/**
 * Search and return one random track from the top `pool` results.
 * Prefers normal song-length videos (1-10 min) and skips URLs in `exclude`.
 */
export async function resolveRandom(
    query: string,
    requestedBy: string,
    pool = 15,
    exclude: string[] = []
): Promise<Track> {
    const info = await runJson([
        '--dump-single-json', '--flat-playlist', '--no-warnings', '--no-playlist',
        `ytsearch${pool}:${query}`,
    ]);
    const all = ((info.entries ?? []) as any[])
        .map((e) => toTrack(e, requestedBy))
        .filter((t): t is Track => t !== null && !exclude.includes(t.url));

    const songs = all.filter((t) => t.duration >= 60 && t.duration <= 600);
    const candidates = songs.length ? songs : all.filter((t) => t.duration > 0);
    const list = candidates.length ? candidates : all;
    if (!list.length) throw new SourceError('NOT_FOUND', 'No results.');
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Start streaming a track's audio. Call `kill()` to stop the download early.
 *
 * `onFail` is called when yt-dlp exits with an error before producing any real audio
 * (YouTube 403 / bot check, outdated yt-dlp, missing JS runtime, unavailable video, ...).
 * Without it such a failure is silent: ffmpeg just receives an empty stream and the
 * track "ends" immediately.
 */
export function createStream(
    url: string,
    onFail?: (reason: string) => void
): { stream: Readable; kill: () => void } {
    const proc = spawn(
        YTDLP,
        ['-f', 'bestaudio/best', '-o', '-', '-q', '--no-playlist', url],
        { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }
    );

    let stderr = '';
    let bytes = 0;
    let killedByUs = false;

    // Count bytes in a pass-through instead of listening to 'data' on stdout, which
    // would start the flow before the audio resource is attached and drop audio.
    const out = new Transform({
        transform(chunk, _enc, cb) {
            bytes += chunk.length;
            cb(null, chunk);
        },
    });
    proc.stdout.pipe(out);

    proc.stderr.on('data', (d) => {
        stderr = (stderr + d).slice(-4000); // keep only the tail; also drains the pipe
    });
    proc.on('error', (e) => out.destroy(e));
    proc.on('close', (code) => {
        if (killedByUs || code === 0 || code === null) return;
        if (bytes > 256 * 1024) return; // played for a while: not a startup failure
        const lines = stderr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const reason =
            [...lines].reverse().find((l) => l.startsWith('ERROR')) ??
            lines[lines.length - 1] ??
            `yt-dlp exited with code ${code}`;
        onFail?.(reason);
    });

    return {
        stream: out,
        kill: () => {
            killedByUs = true;
            proc.kill();
        },
    };
}

export function formatDuration(seconds: number): string {
    if (!seconds) return 'LIVE';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
