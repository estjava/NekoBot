import { log } from '../utils/logger';
// handlers/command.ts
import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';

export default (client: Client): void => {
    const commandsPath = path.join(__dirname, '../commands');
    let loadedCount = 0;

    function loadCommands(dir: string): void {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadCommands(filePath);
                continue;
            }

            // Skip file non-command (misal .d.ts, .map, dll)
            if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
            if (file.endsWith('.d.ts')) continue;

            try {
                const imported = require(filePath);
                const command = imported.default ?? imported; // handle export default ATAU module.exports

                if (!command?.name || typeof command.execute !== 'function') {
                    log.warn(`[commands] Skipped ${file}: no valid 'name' or 'execute'.`);
                    continue;
                }

                const name = String(command.name).toLowerCase();
                if (client.commands.has(name)) {
                    // Usually an old file that was moved but not deleted: the one loaded last wins.
                    log.warn(`[commands] Duplicate command "${name}" in ${file} replaces an earlier one. Delete the old file?`);
                }
                client.commands.set(name, command);
                loadedCount++;
            } catch (err) {
                log.error(`[commands] Failed to load ${file}:`, err);
            }
        }
    }

    loadCommands(commandsPath);

    // Names and aliases share one namespace: report clashes instead of silently picking one.
    const owners = new Map<string, string>();
    for (const name of client.commands.keys()) owners.set(name, name);
    for (const [name, command] of client.commands) {
        for (const alias of (command.aliases ?? []) as string[]) {
            const word = alias.toLowerCase();
            const owner = owners.get(word);
            if (owner && owner !== name) log.warn(`[commands] Alias "${word}" of "${name}" is already used by "${owner}".`);
            else owners.set(word, name);
        }
    }

    // Development aid: shows at a glance whether a new command was picked up (and under which category).
    const byCategory = new Map<string, string[]>();
    for (const [name, command] of client.commands) {
        const category = (command.category as string | undefined) ?? '(no category)';
        byCategory.set(category, [...(byCategory.get(category) ?? []), name]);
    }
    log.debug(`[commands] ${client.commands.size} loaded`);
    for (const [category, names] of byCategory) log.debug(`[commands]   ${category}: ${names.join(', ')}`);
};