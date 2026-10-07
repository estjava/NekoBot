// Copies the JSON assets that tsc does not emit into dist/.
// - locales: always overwritten (read-only translations)
// - database: only copied if missing, so a rebuild never wipes runtime data
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const srcUtils = path.join(root, 'src', 'utils');
const distUtils = path.join(root, 'dist', 'utils');

function copyDir(from, to, { overwrite }) {
    fs.mkdirSync(to, { recursive: true });
    for (const file of fs.readdirSync(from)) {
        if (!file.endsWith('.json')) continue;
        const dest = path.join(to, file);
        if (!overwrite && fs.existsSync(dest)) continue;
        fs.copyFileSync(path.join(from, file), dest);
    }
}

copyDir(path.join(srcUtils, 'locales'), path.join(distUtils, 'locales'), { overwrite: true });
copyDir(path.join(srcUtils, 'database'), path.join(distUtils, 'database'), { overwrite: false });
console.log('✅ Assets copied to dist/utils');
