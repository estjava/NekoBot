import path from 'node:path';
import { DATA_DIR } from './paths';
import { readJsonObject, writeJsonAtomic } from './jsonFile';

/** Per-server settings stored in data/settings.json. Every field is optional = "not set". */
export interface GuildSettings {
    /** Stay in the voice channel after the queue ends instead of leaving when idle. */
    stay247?: boolean;
    /** Minutes of inactivity before leaving. Unset = IDLE_LEAVE_MINUTES from .env (default 3). */
    idleMinutes?: number;
}

export const IDLE_MIN_MINUTES = 1;
export const IDLE_MAX_MINUTES = 60;

const settingsPath = path.join(DATA_DIR, 'settings.json');

// In-memory cache so commands don't hit the disk on every message.
let cache: Record<string, GuildSettings> | undefined;

function load(): Record<string, GuildSettings> {
    return (cache ??= readJsonObject<Record<string, GuildSettings>>(settingsPath));
}

function save(): void {
    writeJsonAtomic(settingsPath, load());
}

/**
 * Read-only snapshot of a server's settings.
 * The old settings.json also had non-server keys like "prefix"; those are not objects, so ignore them.
 */
export function getSettings(guildId: string): GuildSettings {
    const entry = load()[guildId] as unknown;
    return entry && typeof entry === 'object' ? { ...(entry as GuildSettings) } : {};
}

/** Merge `patch` into the server's settings. A value of `undefined` removes that setting. */
export function updateSettings(guildId: string, patch: Partial<GuildSettings>): void {
    const all = load();
    const next: GuildSettings = { ...getSettings(guildId), ...patch };
    for (const key of Object.keys(next) as (keyof GuildSettings)[]) {
        if (next[key] === undefined) delete next[key];
    }
    if (Object.keys(next).length) all[guildId] = next;
    else delete all[guildId];
    save();
}

/** Default idle time from .env, used when a server has not set its own. */
export function defaultIdleMinutes(): number {
    return Number(process.env.IDLE_LEAVE_MINUTES) || 3;
}

export function idleMinutes(guildId: string): number {
    return getSettings(guildId).idleMinutes ?? defaultIdleMinutes();
}
