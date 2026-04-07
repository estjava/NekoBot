const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    
    // Fungsi rekursif untuk membaca semua folder
    function loadCommands(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // Jika folder, panggil fungsi ini lagi (rekursif)
                loadCommands(filePath);
            } else if (file.endsWith('.js')) {
                // Jika file .js, load sebagai command
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
    console.log(`✅ ${client.commands.size} Commands loaded`);
};