import path from 'node:path';
import { DATA_DIR } from './paths';
import { readJsonObject, writeJsonAtomic } from './jsonFile';

export interface Warning {
    reason: string;
    moderatorId: string;
    /** Unix time in milliseconds. */
    timestamp: number;
}

// { [guildId]: { [userId]: Warning[] } }, stored in data/warnings.json
type Store = Record<string, Record<string, Warning[]>>;

const warningsPath = path.join(DATA_DIR, 'warnings.json');

// In-memory cache so commands don't hit the disk every time.
let cache: Store | undefined;

function load(): Store {
    return (cache ??= readJsonObject<Store>(warningsPath));
}

function save(): void {
    writeJsonAtomic(warningsPath, load());
}

/** All warnings of a user in a server, oldest first. */
export function getWarnings(guildId: string, userId: string): Warning[] {
    const list = load()[guildId]?.[userId];
    return Array.isArray(list) ? [...list] : [];
}

/** Adds a warning and returns the user's new total. */
export function addWarning(guildId: string, userId: string, warning: Warning): number {
    const store = load();
    const users = (store[guildId] ??= {});
    const list = (users[userId] ??= []);
    list.push(warning);
    save();
    return list.length;
}

/** Removes warning number `index` (1-based). Returns the removed warning, or null if there is none. */
export function removeWarning(guildId: string, userId: string, index: number): Warning | null {
    const store = load();
    const list = store[guildId]?.[userId];
    if (!list || !Number.isInteger(index) || index < 1 || index > list.length) return null;
    const [removed] = list.splice(index - 1, 1);
    prune(store, guildId, userId);
    save();
    return removed;
}

/** Removes every warning of a user. Returns how many were removed. */
export function clearWarnings(guildId: string, userId: string): number {
    const store = load();
    const count = store[guildId]?.[userId]?.length ?? 0;
    if (!count) return 0;
    delete store[guildId][userId];
    prune(store, guildId, userId);
    save();
    return count;
}

// Keep the file small: drop empty users and servers.
function prune(store: Store, guildId: string, userId: string): void {
    if (store[guildId]?.[userId] && store[guildId][userId].length === 0) delete store[guildId][userId];
    if (store[guildId] && Object.keys(store[guildId]).length === 0) delete store[guildId];
}
