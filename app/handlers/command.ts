import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';

module.exports = (client: Client): void => {
    const commandsPath = path.join(__dirname, '../commands');

    function loadCommands(dir: string): void {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadCommands(filePath);
            } else if (file.endsWith('.js') || file.endsWith('.ts')) {
                // Tambah .ts agar command .ts juga ke-load
                const command = require(filePath);

                if (command.name) {
                    client.commands.set(command.name, command);
                } else {
                    console.log(`⚠️  Command di ${filePath} tidak memiliki property 'name'`);
                }
            }
        }
    }

    loadCommands(commandsPath);
};