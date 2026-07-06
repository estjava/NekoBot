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
                    console.warn(`⚠️  Skip ${file}: tidak punya 'name' atau 'execute' yang valid.`);
                    continue;
                }

                client.commands.set(command.name, command);
                loadedCount++;
            } catch (err) {
                console.error(`❌ Gagal load command ${file}:`, err);
            }
        }
    }

    loadCommands(commandsPath);
};