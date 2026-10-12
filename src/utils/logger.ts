/**
 * Small logger with levels, so the console is useful while developing and quiet on a busy bot.
 *
 *   debug  every command run, loaded commands/events, ...        (default with "npm run dev")
 *   info   start-up lines                                        (default with "npm start")
 *   warn   things that work but deserve a look
 *   error  failures
 *   silent nothing at all
 *
 * "npm run dev" runs the .ts files and "npm start" runs the compiled .js files, which is how the
 * default is chosen. Override it with LOG_LEVEL=debug|info|warn|error|silent in .env.
 */
const ORDER = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 } as const;
type Level = keyof typeof ORDER;

const IS_DEV = __filename.endsWith('.ts');

function minLevel(): Level {
    const wanted = process.env.LOG_LEVEL?.trim().toLowerCase();
    if (wanted && wanted in ORDER) return wanted as Level;
    return IS_DEV ? 'debug' : 'info';
}

// Outside debug mode, warnings and errors are capped per minute: with many servers one broken thing
// (say yt-dlp) would otherwise print the same failure thousands of times.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
let windowStart = 0;
let printed = 0;
let suppressed = 0;

function allowed(): boolean {
    const now = Date.now();
    if (now - windowStart >= WINDOW_MS) {
        if (suppressed > 0) console.warn(`${stamp()} WARN  [log] ${suppressed} warning/error line(s) were suppressed in the last minute`);
        windowStart = now;
        printed = 0;
        suppressed = 0;
    }
    if (printed >= MAX_PER_WINDOW) {
        suppressed++;
        return false;
    }
    printed++;
    return true;
}

const stamp = (): string => new Date().toTimeString().slice(0, 8);

function write(level: Exclude<Level, 'silent'>, args: unknown[]): void {
    const min = minLevel();
    if (ORDER[level] < ORDER[min]) return;
    if ((level === 'warn' || level === 'error') && min !== 'debug' && !allowed()) return;

    const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    out(`${stamp()} ${level.toUpperCase().padEnd(5)}`, ...args);
}

export const log = {
    debug: (...args: unknown[]): void => write('debug', args),
    info: (...args: unknown[]): void => write('info', args),
    warn: (...args: unknown[]): void => write('warn', args),
    error: (...args: unknown[]): void => write('error', args),
};
