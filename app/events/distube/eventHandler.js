const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');

    function loadEvents(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadEvents(filePath); // rekursif
            } else if (file.endsWith('.js')) {
                const event = require(filePath);

                // DisTube events (subfolder distube/)
                if (filePath.includes(`${path.sep}distube${path.sep}`)) {
                    if (event.once) {
                        client.distube.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.distube.on(event.name, (...args) => event.execute(...args, client));
                    }
                } else {
                    // Discord.js events
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args, client));
                    }
                }

                console.log(`✅ ${event.name} event loaded`);
            }
        }
    }

    loadEvents(eventsPath);
};
