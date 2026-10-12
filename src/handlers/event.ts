import { log } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';

interface EventModule {
    name: string;
    once?: boolean;
    execute(...args: any[]): void;
}

export default (client: Client): void => {
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
                    log.warn(`[events] ${file} has no 'name' property.`);
                    continue;
                }

                // An error inside a listener (e.g. the bot may not send messages in that channel) must be
                // caught here; otherwise it ends up as an unhandled 'error' event and stops the whole bot.
                const run = (...args: any[]): void => {
                    Promise.resolve()
                        .then(() => event.execute(...args, client))
                        .catch((err) => log.error(`[event:${event.name}]`, err));
                };

                log.debug(`[events] loaded ${event.name}${event.once ? ' (once)' : ''}`);

                if (event.once) {
                    client.once(event.name, run);
                } else {
                    client.on(event.name, run);
                }
            }
        }
    }

    loadEvents(eventsPath);
};