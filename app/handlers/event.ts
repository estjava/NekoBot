import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';

interface EventModule {
    name: string;
    once?: boolean;
    execute(...args: any[]): void;
}

module.exports = (client: Client): void => {
    const eventsPath = path.join(__dirname, '../events');

    function loadEvents(dir: string): void {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadEvents(filePath);
            } else if (file.endsWith('.js') || file.endsWith('.ts')) {
                const event: EventModule = require(filePath);

                if (!event.name) {
                    console.log(`⚠️  Event di ${filePath} tidak memiliki property 'name'`);
                    continue;
                }

                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
            }
        }
    }

    loadEvents(eventsPath);
};