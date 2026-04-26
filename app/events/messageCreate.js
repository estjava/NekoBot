module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        // Ignore bot messages
        if (message.author.bot) return;
        
        // Get prefix untuk server ini (atau default)
        const guildPrefix = client.prefixes.get(message.guild?.id);
        const prefix = guildPrefix || client.config.prefix;
        
        // Check if message starts with prefix
        if (!message.content.startsWith(prefix)) return;
        
        // Parse command & arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Get command
        const command = client.commands.get(commandName) 
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) return;
        
        // Check permissions
        if (command.permissions) {
            const memberPermissions = message.member.permissions;
            if (!memberPermissions.has(command.permissions)) {
                return message.reply('❌ Kamu tidak memiliki permission untuk menggunakan command ini!');
            }
        }
        
        // Check if owner only
        if (command.ownerOnly && message.author.id !== client.config.ownerId) {
            return message.reply('❌ Command ini hanya untuk owner bot!');
        }
        
        // Execute command
        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('❌ Terjadi error saat menjalankan command!');
        }
    }
};