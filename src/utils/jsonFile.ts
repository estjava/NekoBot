import { log } from './logger';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads a JSON file that holds one object (prefixes, settings, warnings, ...).
 *
 * - File missing: returns {} (normal on first run).
 * - File unreadable or not a JSON object: a copy is saved as "<file>.corrupt-<time>" and {} is returned,
 *   so the next save cannot silently wipe the only copy of the old data.
 */
export function readJsonObject<T extends object = Record<string, unknown>>(file: string): T {
    let raw: string;
    try {
        raw = fs.readFileSync(file, 'utf8');
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {} as T; // first run
        log.warn(`[data] Could not read ${path.basename(file)}: ${(err as Error).message}`);
        return {} as T;
    }

    try {
        // A leading BOM (added by some Windows editors) is not valid JSON, so drop it.
        const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as T;
    } catch {
        // fall through to the backup below
    }

    const backup = `${file}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    try {
        fs.copyFileSync(file, backup);
        log.warn(`[data] ${path.basename(file)} is not valid JSON. Starting empty; the old file was kept as ${path.basename(backup)}.`);
    } catch (err) {
        log.warn(`[data] ${path.basename(file)} is not valid JSON and could not be backed up: ${(err as Error).message}`);
    }
    return {} as T;
}

/**
 * Writes JSON through a temporary file and renames it over the target, so a crash in the middle of
 * writing cannot leave a half-written file behind.
 */
export function writeJsonAtomic(file: string, data: unknown): void {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const json = JSON.stringify(data, null, 2);
    const tmp = `${file}.tmp`;
    try {
        fs.writeFileSync(tmp, json);
        fs.renameSync(tmp, file);
    } catch (err) {
        // Windows can refuse to replace a file that an editor or antivirus has open. Fall back to a plain write.
        log.warn(`[data] Atomic write of ${path.basename(file)} failed (${(err as Error).message}); writing directly.`);
        fs.rmSync(tmp, { force: true });
        fs.writeFileSync(file, json);
    }
}
